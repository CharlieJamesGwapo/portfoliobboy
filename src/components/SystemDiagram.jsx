const slugify = (value) => value.replace(/[^a-z0-9]+/gi, '-').toLowerCase()

const SystemDiagram = ({ nodes, edges, title }) => {
  const labels = new Map(nodes.map((node) => [node.id, node.label]))
  const captionId = `${slugify(title)}-caption`

  return (
    <figure className="system-diagram" aria-labelledby={captionId}>
      <figcaption id={captionId}>{title}</figcaption>
      <div className="system-diagram-canvas">
        <ol className="system-nodes">
          {nodes.map((node, index) => (
            <li key={node.id} data-node-id={node.id}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <strong>{node.label}</strong>
              {node.detail && <small>{node.detail}</small>}
            </li>
          ))}
        </ol>
        <svg className="system-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          {edges.map((edge, index) => (
            <path key={`${edge.from}-${edge.to}-${index}`} d={`M 8 ${12 + index * 14} H 92`} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
      </div>
      <ul className="system-relationships" aria-label="System relationships">
        {edges.map((edge, index) => (
          <li key={`${edge.from}-${edge.to}-${index}`}>
            <span>{labels.get(edge.from)}</span>
            <span aria-hidden="true"> -&gt; </span>
            <span className="sr-only"> connects to </span>
            <span>{labels.get(edge.to)}</span>
            {edge.label && <small>{edge.label}</small>}
          </li>
        ))}
      </ul>
    </figure>
  )
}

export default SystemDiagram
