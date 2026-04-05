import usecases from '../../data/usecases.json'

export default function handler(req, res) {
  // Agent Task Discovery (V2 Reasoning Layer)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('X-Agent-Protocol', 'V2-Usecase-Maturity-1.0')
  
  if (req.query.task) {
    const task = usecases.find(u => u.id === req.query.task.toLowerCase())
    if (task) {
      return res.status(200).json(task)
    }
    return res.status(404).json({ error: `Usecase not found: ${req.query.task}` })
  }

  res.status(200).json({
    protocol: "V2-Agentic-Usecases",
    last_updated: "2026-04-01",
    available_usecases: usecases.map(u => ({
      id: u.id,
      name: u.name,
      merit_score: u.merit_score
    })),
    documentation: "Query a specific usecase by ID using ?task=[id]"
  })
}
