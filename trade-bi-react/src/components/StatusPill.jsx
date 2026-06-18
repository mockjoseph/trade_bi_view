export default function StatusPill({ status }) {
  const styles = {
    paid:     "bg-emerald-950 text-emerald-300 border border-emerald-800",
    invoiced: "bg-amber-950  text-amber-300  border border-amber-800",
    pending:  "bg-blue-950   text-blue-300   border border-blue-800",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}