import { PageHeader, publicStyles as styles } from "@/components/public/PublicUI";
import { RegistrationForm } from "@/components/workspace/account-forms";
export const metadata = { title: "Create account" };
export default function RegisterPage() { return <><PageHeader eyebrow="Participant account" title="Create your account">Use one ANVA account across all conferences and keep your author and reviewer profile current.</PageHeader><div className={styles.narrow}><section className={styles.card}><RegistrationForm /></section></div></>; }
