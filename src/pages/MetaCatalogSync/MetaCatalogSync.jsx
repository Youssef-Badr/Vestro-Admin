import { useState } from "react";
import axios from "../../api/axiosInstance";
import { toast } from "react-toastify";

const MetaCatalogSync = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSync = async () => {
    try {
      setLoading(true);

      const res = await axios.post("/meta/sync-catalog");

      setResult(res.data);

      toast.success("Meta Catalog Sync Completed");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Meta Sync Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="max-w-4xl mx-auto">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">

          <h1 className="text-3xl font-bold mb-2">
            Meta Catalog Management
          </h1>

          <p className="text-slate-400 mb-8">
            Server-to-Server Integration using Meta System User Token
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">

            <div className="bg-slate-800 p-4 rounded-xl">
              <div className="text-slate-400 text-sm">
                Catalog ID
              </div>

              <div className="font-mono mt-2">
                123456789012345
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-xl">
              <div className="text-slate-400 text-sm">
                Access Token
              </div>

              <div className="font-mono mt-2">
                EAAB********************
              </div>
            </div>

          </div>

          <div className="bg-slate-800 p-6 rounded-xl mb-8">

            <h2 className="font-semibold mb-4">
              Catalog Synchronization
            </h2>

            <p className="text-slate-400 mb-6">
              Synchronizes all active products and variants from the
              VESTRO database to Meta Commerce Manager.
            </p>

            <button
              onClick={handleSync}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-semibold transition"
            >
              {loading
                ? "Synchronizing..."
                : "Sync All Products"}
            </button>

          </div>

          {result && (
            <div className="bg-green-900/20 border border-green-600 rounded-xl p-4">

              <div className="font-semibold mb-2">
                Sync Result
              </div>

              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MetaCatalogSync;