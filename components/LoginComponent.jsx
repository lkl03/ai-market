import { signInWithGoogle, signInWithMicrosoft } from '../config/auth';

const LoginComponent = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 sm:grid sm:grid-cols-1 sm:gap-8 lg:gap-16 lg:grid-cols-2">
        <div className="text-left">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Our Marketplace
          </h2>
          <p className="mt-2 text-gray-600">
            Before you can start selling, please log in with your Google account. This ensures a
            secure and seamless experience for all our users.
          </p>
        </div>
        <div className="flex items-center justify-center">
          <div className="rounded-lg bg-white p-8">
            <h3 className="text-lg font-semibold mb-4">Login / Register</h3>
            <button
              onClick={signInWithGoogle}
              className="flex items-center justify-center bg-red-600 text-white w-full py-2 rounded-md"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;