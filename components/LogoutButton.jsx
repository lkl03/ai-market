import { logout } from '../config/auth';

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      await logout();
      // Perform any additional actions after successful logout, e.g., navigate to a different page
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded-md"
    >
      Logout
    </button>
  );
};

export default LogoutButton;