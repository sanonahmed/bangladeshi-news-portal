import { type ReactNode } from "react";
import { type LucideIcon, ChevronDown } from "lucide-react";
import styles from "./StoryComposer.module.css";

export function ComposerSection({
  id,
  icon: Icon,
  index,
  title,
  description,
  action,
  children,
}: {
  id?: string;
  icon: LucideIcon;
  index?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.card}>
      <header className={styles.cardHeader}>
        {index ? (
          <span className={styles.sectionIndex} aria-hidden="true">
            {index}
          </span>
        ) : (
          <span className={styles.sectionIcon}>
            <Icon size={18} aria-hidden="true" />
          </span>
        )}
        <div className={styles.sectionHeading}>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </header>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

export function ComposerDisclosure({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <details className={`${styles.card} ${styles.disclosure}`}>
      <summary className={styles.cardHeader}>
        <span className={styles.sectionIcon}>
          <Icon size={18} aria-hidden="true" />
        </span>
        <span className={styles.sectionHeading}>
          <span className={styles.disclosureTitle}>{title}</span>
          <span className={styles.description}>{description}</span>
        </span>
        <ChevronDown
          size={16}
          className={styles.disclosureChevron}
          aria-hidden="true"
        />
      </summary>
      <div className={styles.advancedContent}>{children}</div>
    </details>
  );
}

export function ComposerField({
  id,
  label,
  hint,
  children,
  optional,
}: {
  id: string;
  label: string;
  hint?: string;
  optional?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldHeading}>
        <label htmlFor={id}>{label}</label>
        {optional && <span>{optional}</span>}
      </div>
      {children}
      {hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
