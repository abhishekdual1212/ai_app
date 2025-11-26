export default function Navbar() {
  return (
    <header className="w-full bg-brand-600 text-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-semibold">Users</div>
        <button
          className="text-sm underline underline-offset-4"
          onClick={() => {
            localStorage.removeItem('admin_auth');
            window.location.href = '/login';
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
