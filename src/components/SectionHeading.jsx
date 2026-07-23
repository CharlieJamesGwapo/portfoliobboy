const SectionHeading = ({ eyebrow, title, description, light = false }) => (
  <div className="section-heading">
    <p className="eyebrow">{eyebrow}</p>
    <h2 className={light ? 'text-ink' : 'text-paper'}>{title}</h2>
    {description && (
      <p className={light ? 'text-slate' : 'text-mist'}>{description}</p>
    )}
  </div>
)

export default SectionHeading
