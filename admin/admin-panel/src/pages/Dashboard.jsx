import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import UserCard from '../components/UserCard.jsx';
import OptionModal from '../components/OptionModal.jsx';
import { fetchLastOrderAt, fetchUsers } from '../utils/api.js';
import { ChevronDown } from 'lucide-react';

export default function Dashboard() {
  const [rawUsers, setRawUsers] = useState([]);
  const [enriched, setEnriched] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('alpha'); // 'alpha' | 'last'
  const [loading, setLoading] = useState(true);
  const [modalUser, setModalUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchUsers();
        if (!mounted) return;

        // fetch last order timestamp per user in parallel
        const withLast = await Promise.all(
          list.map(async (u) => {
            const lastOrderAt = await fetchLastOrderAt(u.uid);
            return { ...u, lastOrderAt: lastOrderAt?.toISOString?.() || null };
          })
        );

        setRawUsers(withLast);
      } catch (e) {
        console.error(e);
        setRawUsers([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const term = search.trim().toLowerCase();
    let arr = rawUsers.filter((u) => (u.displayName || '').toLowerCase().includes(term));

    if (sort === 'last') {
      arr.sort((a, b) => {
        const ta = a.lastOrderAt ? new Date(a.lastOrderAt).getTime() : 0;
        const tb = b.lastOrderAt ? new Date(b.lastOrderAt).getTime() : 0;
        if (tb !== ta) return tb - ta; // newest first
        // tie-breaker: alpha by displayName
        const na = (a.displayName || '').toLowerCase();
        const nb = (b.displayName || '').toLowerCase();
        return na.localeCompare(nb);
      });
    } else {
      arr.sort((a, b) => (a.displayName || '').toLowerCase().localeCompare((b.displayName || '').toLowerCase()));
    }
    setEnriched(arr);
  }, [rawUsers, search, sort]);

  const placeholder = useMemo(() => `Search users by name`, []);

  return (
    <div className="min-h-screen bg-brand-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Search + Filter row */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-white border border-slate-200 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div className="relative w-full md:w-56">
            <select
              className="appearance-none w-full bg-white border border-slate-200 rounded-md px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-brand-600"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="alpha">Alphabetical (A–Z)</option>
              <option value="last">Last Updated</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="text-slate-600">Loading users…</div>
          ) : enriched.length === 0 ? (
            <div className="text-slate-600">No users found.</div>
          ) : (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {enriched.map((u) => (
                <UserCard key={u.uid} user={u} onOpen={setModalUser} />
              ))}
            </div>
          )}
        </div>
      </main>

      <OptionModal open={!!modalUser} onClose={() => setModalUser(null)} user={modalUser} />
    </div>
  );
}
