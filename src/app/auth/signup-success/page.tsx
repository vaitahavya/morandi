import Link from 'next/link';

export default function SignupSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-green-500 text-6xl">✅</div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Morandi Lifestyle!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your account has been created successfully.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-700 mb-4">
            Thank you for joining our community! We're excited to have you with us.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In to Your Account
            </Link>
            
            <Link
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Start exploring our collection of comfortable maternity and baby apparel.
          </p>
        </div>
      </div>
    </div>
  );
}
