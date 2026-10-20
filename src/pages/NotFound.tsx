import Container from "../components/Container";
import { useSite } from "../components/SiteProvider";
import ButtonLink from "../components/ButtonLink";

export default function NotFound() {
  const { t } = useSite();
  return (
    <Container className="pt-40 pb-24 text-center">
      <p className="font-mono text-7xl font-medium text-accent">404</p>
      <h1 className="mt-4 text-3xl font-bold">{t("notfound.title")}</h1>
      <p className="mt-3 text-ink-soft">{t("notfound.text")}</p>
      <ButtonLink to="/" className="mt-8">{t("notfound.button")}</ButtonLink>
    </Container>
  );
}
