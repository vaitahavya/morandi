import { PrismaClient, Returns } from '@prisma/client';
import { BaseRepository, FindManyOptions, PaginatedResult } from './base/BaseRepository';

/**
 * Return creation input type
 */
export interface CreateReturnInput {
  returnNumber: string;
  orderId: string;
  customerEmail: string;
  customerPhone?: string;
  returnReason: string;
  returnDescription?: string;
  status: string;
  returnType: string;
  refundAmount: number;
  images?: string;
  videos?: string;
  items: CreateReturnItemInput[];
}

/**
 * Return item creation input type
 */
export interface CreateReturnItemInput {
  orderItemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalRefundAmount: number;
  restockable?: boolean;
}

/**
 * Return update input type
 */
export interface UpdateReturnInput {
  status?: string;
  returnReason?: string;
  returnDescription?: string;
  refundAmount?: number;
  images?: string;
  videos?: string;
  processedBy?: string;
  qcBy?: string;
}

/**
 * Return filter input type
 */
export interface ReturnFilters {
  status?: string;
  orderId?: string;
  customerEmail?: string;
  returnType?: string;
  dateFrom?: Date;
  dateTo?: Date;
  processedBy?: string;
  qcBy?: string;
}

/**
 * Return with items type
 */
export interface ReturnWithItems extends Returns {
  returnItems: any[];
  order?: any;
}

/**
 * Return repository interface
 */
export interface IReturnRepository {
  create(data: CreateReturnInput): Promise<ReturnWithItems>;
  findById(id: string): Promise<ReturnWithItems | null>;
  findByReturnNumber(returnNumber: string): Promise<ReturnWithItems | null>;
  findMany(filters?: ReturnFilters, options?: FindManyOptions): Promise<PaginatedResult<ReturnWithItems>>;
  update(id: string, data: UpdateReturnInput): Promise<ReturnWithItems>;
  delete(id: string): Promise<void>;
  getReturnsByOrder(orderId: string): Promise<ReturnWithItems[]>;
  getReturnsByCustomer(customerEmail: string, options?: FindManyOptions): Promise<PaginatedResult<ReturnWithItems>>;
  updateReturnStatus(id: string, status: string, notes?: string, changedBy?: string): Promise<ReturnWithItems>;
  getReturnStats(filters?: ReturnFilters): Promise<{
    totalReturns: number;
    totalRefundAmount: number;
    averageRefundAmount: number;
    statusBreakdown: Record<string, number>;
  }>;
}

/**
 * Return repository implementation
 */
export class ReturnRepository extends BaseRepository<ReturnWithItems, CreateReturnInput, UpdateReturnInput, ReturnFilters> 
  implements IReturnRepository {

  async create(data: CreateReturnInput): Promise<ReturnWithItems> {
    return await this.prisma.$transaction(async (tx) => {
      // Create the return
      const returnRecord = await tx.returns.create({
        data: {
          returnNumber: data.returnNumber,
          orderId: data.orderId,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          returnReason: data.returnReason,
          returnDescription: data.returnDescription,
          status: data.status,
          returnType: data.returnType,
          refundAmount: data.refundAmount,
          images: data.images,
          videos: data.videos,
        },
      });

      // Create return items
      const returnItems = await Promise.all(
        data.items.map(item =>
          tx.returnItem.create({
            data: {
              returnId: returnRecord.id,
              orderItemId: item.orderItemId,
              productId: item.productId,
              productName: item.productName,
              quantityReturned: item.quantity,
              unitPrice: item.unitPrice,
              totalRefundAmount: item.totalRefundAmount,
              restockable: item.restockable,
            },
          })
        )
      );

      // Return return with items
      return {
        ...returnRecord,
        returnItems: returnItems,
      } as any;
    });
  }

  async findById(id: string): Promise<ReturnWithItems | null> {
    return await this.prisma.returns.findUnique({
      where: { id },
      include: {
        returnItems: true,
        order: true,
      },
    });
  }

  async findByReturnNumber(returnNumber: string): Promise<ReturnWithItems | null> {
    return await this.prisma.returns.findUnique({
      where: { returnNumber: returnNumber },
      include: {
        returnItems: true,
        order: true,
      },
    });
  }

  async findMany(filters: ReturnFilters = {}, options: FindManyOptions = {}): Promise<PaginatedResult<ReturnWithItems>> {
    const { page, limit, skip } = this.buildPaginationOptions(options);
    const orderBy = this.buildOrderBy(options.sortBy, options.sortOrder);

    // Build where clause
    const where: any = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.orderId) {
      where.orderId = filters.orderId;
    }
    if (filters.customerEmail) {
      where.customerEmail = { contains: filters.customerEmail, mode: 'insensitive' };
    }
    if (filters.returnType) {
      where.returnType = filters.returnType;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }
    if (filters.processedBy) {
      where.processedBy = filters.processedBy;
    }
    if (filters.qcBy) {
      where.qcBy = filters.qcBy;
    }

    const [returns, total] = await Promise.all([
      this.prisma.returns.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          returnItems: true,
          order: true,
        },
      }),
      this.prisma.returns.count({ where }),
    ]);

    return {
      data: returns,
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  async update(id: string, data: UpdateReturnInput): Promise<ReturnWithItems> {
    const updateData: any = {};
    
    // Map camelCase fields - Prisma handles the mapping to database columns
    if (data.status !== undefined) updateData.status = data.status;
    if (data.returnReason !== undefined) updateData.returnReason = data.returnReason;
    if (data.returnDescription !== undefined) updateData.returnDescription = data.returnDescription;
    if (data.refundAmount !== undefined) updateData.refundAmount = data.refundAmount;
    if (data.processedBy !== undefined) updateData.processedBy = data.processedBy;
    if (data.qcBy !== undefined) updateData.qcBy = data.qcBy;
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    return await this.prisma.returns.update({
      where: { id },
      data: updateData,
      include: {
        returnItems: true,
        order: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.returns.delete({
      where: { id },
    });
  }

  async getReturnsByOrder(orderId: string): Promise<ReturnWithItems[]> {
    return await this.prisma.returns.findMany({
      where: { orderId: orderId },
      include: {
        returnItems: true,
        order: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReturnsByCustomer(customerEmail: string, options: FindManyOptions = {}): Promise<PaginatedResult<ReturnWithItems>> {
    return await this.findMany(
      { customerEmail },
      options
    );
  }

  async updateReturnStatus(id: string, status: string, notes?: string, changedBy?: string): Promise<ReturnWithItems> {
    return await this.prisma.$transaction(async (tx) => {
      // Update the return
      const returnRecord = await tx.returns.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      // Create status history entry if notes or changedBy provided
      if (notes || changedBy) {
        await tx.returnStatusHistory.create({
          data: {
            returnId: id,
            status,
            notes,
          },
        });
      }

      // Return return with items
      return await this.findById(id) as ReturnWithItems;
    });
  }

  async getReturnStats(filters: ReturnFilters = {}): Promise<{
    totalReturns: number;
    totalRefundAmount: number;
    averageRefundAmount: number;
    statusBreakdown: Record<string, number>;
  }> {
    // Build where clause
    const where: any = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.orderId) where.orderId = filters.orderId;
    if (filters.customerEmail) where.customerEmail = { contains: filters.customerEmail, mode: 'insensitive' };
    if (filters.returnType) where.returnType = filters.returnType;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const [totalReturns, returns, statusBreakdown] = await Promise.all([
      this.prisma.returns.count({ where }),
      this.prisma.returns.findMany({
        where,
        select: { refundAmount: true, status: true },
      }),
      this.prisma.returns.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
    ]);

    const totalRefundAmount = returns.reduce((sum, returnRecord) => sum + Number(returnRecord.refundAmount || 0), 0);
    const averageRefundAmount = totalReturns > 0 ? totalRefundAmount / totalReturns : 0;

    const statusBreakdownMap = statusBreakdown.reduce((acc, item) => {
      acc[item.status || 'unknown'] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalReturns,
      totalRefundAmount,
      averageRefundAmount,
      statusBreakdown: statusBreakdownMap,
    };
  }
}

// Export singleton instance
export const returnRepository = new ReturnRepository(new PrismaClient());
