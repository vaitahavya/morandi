import { PrismaClient, returns } from '@prisma/client';
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
  refundAmount?: number;
  images: string[];
  videos: string[];
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
  images?: string[];
  videos?: string[];
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
export interface ReturnWithItems extends returns {
  return_items: any[];
  order?: any;
  return_status_history?: any[];
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
          return_number: data.returnNumber,
          order_id: data.orderId,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone,
          return_reason: data.returnReason,
          return_description: data.returnDescription,
          status: data.status,
          return_type: data.returnType,
          refund_amount: data.refundAmount,
          images: data.images,
          videos: data.videos,
        },
      });

      // Create return items
      const returnItems = await Promise.all(
        data.items.map(item =>
          tx.return_items.create({
            data: {
              return_id: returnRecord.id,
              order_item_id: item.orderItemId,
              product_id: item.productId,
              product_name: item.productName,
              quantity_returned: item.quantity,
              unit_price: item.unitPrice,
              total_refund_amount: item.totalRefundAmount,
              restockable: item.restockable,
            },
          })
        )
      );

      // Return return with items
      return {
        ...returnRecord,
        return_items: returnItems,
      };
    });
  }

  async findById(id: string): Promise<ReturnWithItems | null> {
    return await this.prisma.returns.findUnique({
      where: { id },
      include: {
        return_items: true,
        orders: true,
        users_returns_processed_byTousers: true,
        users_returns_qc_byTousers: true,
        return_status_history: {
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  async findByReturnNumber(returnNumber: string): Promise<ReturnWithItems | null> {
    return await this.prisma.returns.findUnique({
      where: { return_number: returnNumber },
      include: {
        return_items: true,
        orders: true,
        users_returns_processed_byTousers: true,
        users_returns_qc_byTousers: true,
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
      where.order_id = filters.orderId;
    }
    if (filters.customerEmail) {
      where.customer_email = { contains: filters.customerEmail, mode: 'insensitive' };
    }
    if (filters.returnType) {
      where.return_type = filters.returnType;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.created_at = {};
      if (filters.dateFrom) {
        where.created_at.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.created_at.lte = filters.dateTo;
      }
    }
    if (filters.processedBy) {
      where.processed_by = filters.processedBy;
    }
    if (filters.qcBy) {
      where.qc_by = filters.qcBy;
    }

    const [returns, total] = await Promise.all([
      this.prisma.returns.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { created_at: 'desc' },
        include: {
          return_items: true,
          orders: true,
          users_returns_processed_byTousers: true,
          users_returns_qc_byTousers: true,
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
    const updateData: any = { ...data };
    
    // Map camelCase to snake_case for database fields
    if (data.returnReason !== undefined) updateData.return_reason = data.returnReason;
    if (data.returnDescription !== undefined) updateData.return_description = data.returnDescription;
    if (data.refundAmount !== undefined) updateData.refund_amount = data.refundAmount;
    if (data.processedBy !== undefined) updateData.processed_by = data.processedBy;
    if (data.qcBy !== undefined) updateData.qc_by = data.qcBy;
    
    // Always update the updatedAt timestamp
    updateData.updated_at = new Date();

    return await this.prisma.returns.update({
      where: { id },
      data: updateData,
      include: {
        return_items: true,
        orders: true,
        users_returns_processed_byTousers: true,
        users_returns_qc_byTousers: true,
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
      where: { order_id: orderId },
      include: {
        return_items: true,
        orders: true,
        users_returns_processed_byTousers: true,
        users_returns_qc_byTousers: true,
      },
      orderBy: { created_at: 'desc' },
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
          updated_at: new Date(),
        },
      });

      // Create status history entry if notes or changedBy provided
      if (notes || changedBy) {
        await tx.return_status_history.create({
          data: {
            return_id: id,
            status,
            notes,
            changed_by: changedBy,
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
    if (filters.orderId) where.order_id = filters.orderId;
    if (filters.customerEmail) where.customer_email = { contains: filters.customerEmail, mode: 'insensitive' };
    if (filters.returnType) where.return_type = filters.returnType;
    if (filters.dateFrom || filters.dateTo) {
      where.created_at = {};
      if (filters.dateFrom) where.created_at.gte = filters.dateFrom;
      if (filters.dateTo) where.created_at.lte = filters.dateTo;
    }

    const [totalReturns, returns, statusBreakdown] = await Promise.all([
      this.prisma.returns.count({ where }),
      this.prisma.returns.findMany({
        where,
        select: { refund_amount: true, status: true },
      }),
      this.prisma.returns.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
    ]);

    const totalRefundAmount = returns.reduce((sum, returnRecord) => sum + Number(returnRecord.refund_amount || 0), 0);
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
