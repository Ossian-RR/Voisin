import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <section className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <p className="font-display text-6xl font-extrabold text-primary">404</p>
      <h1 className="font-display mt-3 text-xl font-extrabold">
        Cette page a déménagé
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Nous n’avons rien trouvé à cette adresse.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
      >
        Retour aux objets
      </Link>
    </section>
  );
};

export default NotFound;
