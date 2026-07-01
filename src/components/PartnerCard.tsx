const PARTNER_HREF = "https://coinacademy.fr/go-okx";

export function PartnerCard() {
  return (
    <aside className="group sm:mx-auto sm:my-1 sm:w-full sm:max-w-2xl sm:self-center">
      <a
        href={PARTNER_HREF}
        target="_blank"
        rel="sponsored noopener noreferrer"
        aria-label="Recevez jusqu'à 400€ en BTC en tradant sur OKX"
        className="block overflow-hidden rounded-lg border border-[var(--border)] bg-[#0a1a0e] transition duration-150 hover:border-[var(--marker)]/40"
      >
        <img
          src="/img/partners/p400.png"
          alt="Recevez jusqu'à 400€ en BTC en tradant sur OKX"
          loading="lazy"
          decoding="async"
          className="block h-auto w-full transition duration-500 group-hover:scale-[1.02]"
        />
      </a>
    </aside>
  );
}
