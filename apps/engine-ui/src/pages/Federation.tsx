import { useAuth } from '../store/auth'

export function Federation() {
  const { space } = useAuth()
  if (!space) return null

  const domain = window.location.hostname
  const actorURL = `${window.location.origin}/ap/users/${space.handle}`
  const webfingerURL = `${window.location.origin}/.well-known/webfinger?resource=acct:${space.handle}@${domain}`

  return (
    <div>
      <h1 style={h1}>Federation (ActivityPub)</h1>

      <Section title="AP Actor URL">
        <a href={actorURL} target="_blank" rel="noreferrer" style={link}>{actorURL}</a>
        <div style={hint}>Open with <code>Accept: application/activity+json</code> to see your Actor JSON.</div>
      </Section>

      <Section title="WebFinger URL">
        <a href={webfingerURL} target="_blank" rel="noreferrer" style={link}>{webfingerURL}</a>
        <div style={hint}>Used by remote servers to discover your Actor.</div>
      </Section>

      <Section title="Follow from Mastodon">
        <p style={hint}>In the Mastodon search bar, enter:</p>
        <code style={code}>@{space.handle}@{domain}</code>
        <p style={{ ...hint, marginTop: 12 }}>
          Mastodon will resolve your WebFinger, fetch your Actor JSON, and send a Follow activity to your inbox at{' '}
          <code>{actorURL}/inbox</code>.
        </p>
      </Section>

      <Section title="AP Endpoints">
        <table style={table}>
          <tbody>
            {[
              ['Actor', 'GET', actorURL],
              ['Inbox', 'POST', `${actorURL}/inbox`],
              ['Outbox', 'GET', `${actorURL}/outbox`],
              ['Followers', 'GET', `${actorURL}/followers`],
              ['Following', 'GET', `${actorURL}/following`],
            ].map(([name, method, url]) => (
              <tr key={name}>
                <td style={td}><strong style={{ color: '#94a3b8' }}>{name}</strong></td>
                <td style={td}><code style={{ color: '#84cc16' }}>{method}</code></td>
                <td style={td}><code style={{ color: '#64748b', fontSize: 11 }}>{url}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={section}>
      <div style={sectionTitle}>{title}</div>
      <div style={body}>{children}</div>
    </div>
  )
}

const h1: React.CSSProperties = { color: '#f1f5f9', fontSize: 22, fontWeight: 700, marginBottom: 20 }
const section: React.CSSProperties = { background: '#1e293b', border: '1px solid #334155', borderRadius: 10, marginBottom: 16, overflow: 'hidden' }
const sectionTitle: React.CSSProperties = { background: '#0f172a', color: '#84cc16', fontWeight: 600, fontSize: 13, padding: '10px 18px', borderBottom: '1px solid #334155' }
const body: React.CSSProperties = { padding: '16px 18px' }
const link: React.CSSProperties = { color: '#84cc16', fontSize: 13, wordBreak: 'break-all' }
const code: React.CSSProperties = { color: '#84cc16', fontSize: 15, display: 'block', margin: '8px 0', padding: '8px 12px', background: '#0f172a', borderRadius: 6 }
const hint: React.CSSProperties = { color: '#64748b', fontSize: 13, marginTop: 8 }
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' }
const td: React.CSSProperties = { padding: '6px 12px', fontSize: 12, borderBottom: '1px solid #1e293b', verticalAlign: 'top' }
