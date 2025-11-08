'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface ShippingRateRecord {
  id: string;
  name?: string | null;
  pincode?: string | null;
  pincodePrefix?: string | null;
  zone?: string | null;
  baseCost: number;
  surcharge?: number | null;
  freeShippingThreshold?: number | null;
  estimatedDeliveryMin?: number | null;
  estimatedDeliveryMax?: number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ShippingRatesResponse {
  success: boolean;
  data: ShippingRateRecord[];
  pagination?: {
    total: number;
  };
}

const initialFormState = {
  name: '',
  pincode: '',
  pincodePrefix: '',
  zone: '',
  baseCost: '',
  surcharge: '',
  freeShippingThreshold: '',
  estimatedDeliveryMin: '',
  estimatedDeliveryMax: '',
  isActive: true,
  notes: '',
};

export default function ShippingManager() {
  const [rates, setRates] = useState<ShippingRateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);

  const totalActive = useMemo(
    () => rates.filter((rate) => rate.isActive).length,
    [rates],
  );

  const loadRates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shipping/rates?limit=100');
      const result: ShippingRatesResponse = await response.json();
      if (!response.ok || !result.success) {
        throw new Error((result as any)?.error || 'Unable to load shipping rates.');
      }
      setRates(result.data ?? []);
    } catch (error) {
      console.error('Failed to load shipping rates:', error);
      toast.error('Failed to load shipping rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates().catch(() => undefined);
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateRate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.baseCost) {
      toast.error('Base shipping cost is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name || undefined,
        pincode: formData.pincode || undefined,
        pincodePrefix: formData.pincodePrefix || undefined,
        zone: formData.zone || undefined,
        baseCost: Number(formData.baseCost),
        surcharge: formData.surcharge ? Number(formData.surcharge) : undefined,
        freeShippingThreshold: formData.freeShippingThreshold
          ? Number(formData.freeShippingThreshold)
          : undefined,
        estimatedDeliveryMin: formData.estimatedDeliveryMin
          ? Number(formData.estimatedDeliveryMin)
          : undefined,
        estimatedDeliveryMax: formData.estimatedDeliveryMax
          ? Number(formData.estimatedDeliveryMax)
          : undefined,
        isActive: formData.isActive,
        notes: formData.notes || undefined,
      };

      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to save shipping rate.');
      }

      toast.success('Shipping rate created successfully.');
      setFormData(initialFormState);
      await loadRates();
    } catch (error: any) {
      console.error('Failed to create shipping rate:', error);
      toast.error(error.message || 'Failed to create shipping rate.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (rate: ShippingRateRecord) => {
    try {
      const response = await fetch(`/api/shipping/rates/${rate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !rate.isActive }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update rate.');
      }
      toast.success(`Shipping rate ${!rate.isActive ? 'activated' : 'disabled'}.`);
      await loadRates();
    } catch (error) {
      console.error('Failed to toggle rate:', error);
      toast.error('Unable to update shipping rate status.');
    }
  };

  const handleDeleteRate = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this shipping rate?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/shipping/rates/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete rate.');
      }
      toast.success('Shipping rate deleted.');
      await loadRates();
    } catch (error) {
      console.error('Failed to delete rate:', error);
      toast.error('Unable to delete shipping rate.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Configuration</CardTitle>
          <CardDescription>
            Add and manage shipping cost rules by pincode, prefix, or zone. These rates are applied
            automatically during checkout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Bengaluru Urban"
                />
              </div>
              <div>
                <Label htmlFor="zone">Zone</Label>
                <Input
                  id="zone"
                  name="zone"
                  value={formData.zone}
                  onChange={handleInputChange}
                  placeholder="South Zone"
                />
              </div>
              <div>
                <Label htmlFor="pincode">Exact Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="560001"
                />
              </div>
              <div>
                <Label htmlFor="pincodePrefix">Pincode Prefix</Label>
                <Input
                  id="pincodePrefix"
                  name="pincodePrefix"
                  value={formData.pincodePrefix}
                  onChange={handleInputChange}
                  placeholder="560"
                />
              </div>
              <div>
                <Label htmlFor="baseCost">Base Cost (₹)</Label>
                <Input
                  id="baseCost"
                  name="baseCost"
                  value={formData.baseCost}
                  onChange={handleInputChange}
                  type="number"
                  min="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="surcharge">Surcharge (₹)</Label>
                <Input
                  id="surcharge"
                  name="surcharge"
                  value={formData.surcharge}
                  onChange={handleInputChange}
                  type="number"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
                <Input
                  id="freeShippingThreshold"
                  name="freeShippingThreshold"
                  value={formData.freeShippingThreshold}
                  onChange={handleInputChange}
                  type="number"
                  min="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimatedDeliveryMin">Est. Delivery Min (days)</Label>
                  <Input
                    id="estimatedDeliveryMin"
                    name="estimatedDeliveryMin"
                    value={formData.estimatedDeliveryMin}
                    onChange={handleInputChange}
                    type="number"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedDeliveryMax">Est. Delivery Max (days)</Label>
                  <Input
                    id="estimatedDeliveryMax"
                    name="estimatedDeliveryMax"
                    value={formData.estimatedDeliveryMax}
                    onChange={handleInputChange}
                    type="number"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Input
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Optional internal notes"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Add Shipping Rate'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Configured Rates</CardTitle>
              <CardDescription>
                {rates.length} rate{rates.length === 1 ? '' : 's'} configured • {totalActive} active
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{totalActive} active</Badge>
              <Badge variant="outline">{rates.length - totalActive} inactive</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : rates.length === 0 ? (
            <p className="text-sm text-gray-500">
              No shipping rates configured yet. Add your first rule above.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Target</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Zone</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Cost</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Free Above</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Delivery</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-2 text-right font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rates.map((rate) => {
                    const target =
                      rate.pincode ||
                      (rate.pincodePrefix ? `${rate.pincodePrefix}*` : 'Default');
                    const deliveryText =
                      rate.estimatedDeliveryMin != null
                        ? `${rate.estimatedDeliveryMin}-${rate.estimatedDeliveryMax ?? rate.estimatedDeliveryMin
                          } days`
                        : '—';

                    return (
                      <tr key={rate.id}>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium">{target}</span>
                            {rate.name && (
                              <span className="text-xs text-gray-500">{rate.name}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{rate.zone || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">
                          ₹{rate.baseCost.toFixed(2)}
                          {rate.surcharge ? (
                            <span className="text-xs text-gray-500"> + ₹{rate.surcharge}</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {rate.freeShippingThreshold != null
                            ? `₹${rate.freeShippingThreshold.toFixed(2)}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{deliveryText}</td>
                        <td className="px-4 py-3">
                          <Badge variant={rate.isActive ? 'default' : 'outline'}>
                            {rate.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(rate)}
                            >
                              {rate.isActive ? 'Disable' : 'Activate'}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteRate(rate.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

