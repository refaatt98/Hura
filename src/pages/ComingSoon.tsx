import { Construction } from "lucide-react";
import Container from "../components/Container";
import ButtonLink from "../components/ButtonLink";

/** Temporary page for routes that will be built in the next steps. */
export default function ComingSoon({ title }: { title: string }) {
  return (
    <Container className="pt-40 pb-24 text-center">
      <Construction className="mx-auto size-12 text-accent" />
      <h1 className="mt-6 text-4xl font-bold">{title}</h1>
      <p className="mt-3 text-ink-soft">هالصفحة قيد البناء — رح تجهز بالخطوات الجاية.</p>
      <ButtonLink to="/" variant="ghost" className="mt-8">
        رجوع للرئيسية
      </ButtonLink>
    </Container>
  );
}
