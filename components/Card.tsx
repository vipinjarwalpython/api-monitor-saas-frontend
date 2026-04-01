export default function Card({ title, value }: any) {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-700">

      <p className="text-gray-400 text-sm mb-2">{title}</p>

      <h2 className="text-3xl font-bold">{value}</h2>

    </div>
  );
}