import WooCommerceSync from '@/components/admin/WooCommerceSync';

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your e-commerce store and integrations
          </p>
        </div>

        <div className="space-y-8">
          <WooCommerceSync />
          
          {/* Additional admin sections can be added here */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Database</h3>
                <p className="text-sm text-gray-600 mb-3">
                  View and manage your Supabase database
                </p>
                <a 
                  href="https://supabase.com/dashboard/project/ohipggwnmnypiubsbcvu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Open Supabase Dashboard →
                </a>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium mb-2">Environment</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Check your environment configuration
                </p>
                <a 
                  href="/api/test-wordpress"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Test WordPress API →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 