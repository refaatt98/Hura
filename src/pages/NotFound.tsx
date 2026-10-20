import Container from "../components/Container";
import ButtonLink from "../components/ButtonLink";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="font-mono text-7xl font-medium text-accent">404</p>
      <h1 className="mt-4 text-3xl font-bold">هالصفحة مش بالدفتر</h1>
      <p className="mt-3 text-ink-soft">يمكن الرابط غلط أو الصفحة انشالت.</p>
      <ButtonLink to="/" className="mt-8">رجوع للرئيسية</ButtonLink>
    </Container>
  );
}
