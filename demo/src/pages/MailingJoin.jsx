import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'

export default function MailingJoin() {
  const { slug } = useParams()
  const nav = useNavigate()
  const { data, addMailingEntry } = useStore()

  const list = useMemo(() =>
    (data.mailingLists || []).find(l => l.shareSlug === slug),
  [data.mailingLists, slug])

  const [step, setStep] = useState(0) // 0=basics, 1=roles, 2=done
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', zip: '', preferredContact: '', customAnswer: '' })
  const [selectedRoles, setSelectedRoles] = useState([])
  const [roleData, setRoleData] = useState({}) // { [roleName]: { [qid]: value } }
  const [currentRoleIdx, setCurrentRoleIdx] = useState(0)
  const [errors, setErrors] = useState({})

  if (!list) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>List not found</div>
        <div style={{ fontSize: 14, color: '#64748b' }}>This sign-up form may have been removed or the link is incorrect.</div>
        <button onClick={() => nav('/')} style={{ background: '#84cc16', color: '#0f172a', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>Go Home</button>
      </div>
    )
  }

  if (list.active === false) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ fontSize: 48 }}>🚫</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>Sign-ups paused</div>
        <div style={{ fontSize: 14, color: '#64748b' }}>This list is not currently accepting new sign-ups.</div>
      </div>
    )
  }

  const fields = list.fields || {}
  const roles = list.roles || []

  function validateBasics() {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Name is required'
    if (fields.email?.enabled !== false && (fields.email?.required !== false) && !formData.email.trim()) errs.email = 'Email is required'
    if (fields.phone?.required && !formData.phone.trim()) errs.phone = 'Phone is required'
    if (fields.zip?.required && !formData.zip.trim()) errs.zip = 'Zip code is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleBasicsSubmit() {
    if (!validateBasics()) return
    if (roles.length > 0) {
      setStep(1)
    } else {
      submitEntry()
    }
  }

  function toggleRole(label) {
    setSelectedRoles(prev => prev.includes(label) ? prev.filter(r => r !== label) : [...prev, label])
  }

  function setRoleAnswer(roleName, qid, value) {
    setRoleData(prev => ({
      ...prev,
      [roleName]: { ...(prev[roleName] || {}), [qid]: value },
    }))
  }

  function toggleRoleAnswerOption(roleName, qid, option) {
    const current = (roleData[roleName]?.[qid]) || []
    const next = Array.isArray(current)
      ? current.includes(option) ? current.filter(o => o !== option) : [...current, option]
      : [option]
    setRoleAnswer(roleName, qid, next)
  }

  function submitEntry() {
    addMailingEntry(list.id, {
      data: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        zip: formData.zip.trim(),
        preferredContact: formData.preferredContact,
        customAnswer: formData.customAnswer.trim(),
        roles: selectedRoles,
        roleData,
      },
    })
    setStep(2)
  }

  const inputSt = {
    width: '100%', boxSizing: 'border-box',
    background: '#1e293b', border: '1px solid #334155',
    borderRadius: 6, padding: '9px 12px', color: '#f1f5f9', fontSize: 14,
  }
  const labelSt = { display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 5 }
  const fieldWrap = { marginBottom: 18 }
  const primaryBtn = { background: '#84cc16', color: '#0f172a', border: 'none', borderRadius: 6, padding: '10px 28px', fontSize: 15, cursor: 'pointer', fontWeight: 700 }
  const ghostBtn = { background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 6, padding: '10px 20px', fontSize: 14, cursor: 'pointer' }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px' }}>
      {/* Header */}
      <div style={{ maxWidth: 560, width: '100%', marginBottom: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#84cc16', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>Sign Up</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{list.name}</div>
        {list.description && <div style={{ fontSize: 15, color: '#94a3b8' }}>{list.description}</div>}
      </div>

      <div style={{ maxWidth: 560, width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '28px 28px', boxShadow: '0 8px 32px rgba(0,0,0,.4)' }}>

        {/* Step 0 — Basics */}
        {step === 0 && (
          <>
            <div style={fieldWrap}>
              <label style={labelSt}>Name *</label>
              <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" style={{ ...inputSt, borderColor: errors.name ? '#ef4444' : '#334155' }} />
              {errors.name && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.name}</div>}
            </div>

            {fields.email?.enabled !== false && (
              <div style={fieldWrap}>
                <label style={labelSt}>Email {fields.email?.required !== false ? '*' : ''}</label>
                <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" style={{ ...inputSt, borderColor: errors.email ? '#ef4444' : '#334155' }} />
                {errors.email && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.email}</div>}
              </div>
            )}

            {fields.phone?.enabled && (
              <div style={fieldWrap}>
                <label style={labelSt}>Phone {fields.phone?.required ? '*' : '(optional)'}</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} placeholder="+1 (555) 000-0000" style={{ ...inputSt, borderColor: errors.phone ? '#ef4444' : '#334155' }} />
                {errors.phone && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.phone}</div>}
              </div>
            )}

            {fields.zip?.enabled && (
              <div style={fieldWrap}>
                <label style={labelSt}>Zip / Postal Code {fields.zip?.required ? '*' : '(optional)'}</label>
                <input value={formData.zip} onChange={e => setFormData(f => ({ ...f, zip: e.target.value }))} placeholder="98101" style={{ ...inputSt, borderColor: errors.zip ? '#ef4444' : '#334155' }} />
                {errors.zip && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.zip}</div>}
              </div>
            )}

            {fields.preferredContact?.enabled && (
              <div style={fieldWrap}>
                <label style={labelSt}>Preferred contact method {fields.preferredContact?.required ? '*' : '(optional)'}</label>
                <select value={formData.preferredContact} onChange={e => setFormData(f => ({ ...f, preferredContact: e.target.value }))}
                  style={{ ...inputSt, cursor: 'pointer' }}>
                  <option value="">— Select —</option>
                  {['Email', 'Phone call', 'Text / SMS', 'WhatsApp', 'Instagram DM', 'Twitter / X DM'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {fields.customQuestion?.enabled && fields.customQuestion?.label && (
              <div style={fieldWrap}>
                <label style={labelSt}>{fields.customQuestion.label}</label>
                <input value={formData.customAnswer} onChange={e => setFormData(f => ({ ...f, customAnswer: e.target.value }))} style={inputSt} />
              </div>
            )}

            {roles.length > 0 && (
              <div style={{ background: '#0f172a', borderRadius: 6, padding: '12px 14px', marginBottom: 18, fontSize: 13, color: '#94a3b8' }}>
                Next you'll select your role{roles.length > 1 ? 's' : ''} and answer a few quick questions.
              </div>
            )}

            <button onClick={handleBasicsSubmit} style={primaryBtn}>
              {roles.length > 0 ? 'Next →' : 'Sign Up'}
            </button>
          </>
        )}

        {/* Step 1 — Roles */}
        {step === 1 && (
          <>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>What best describes you?</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>Select all that apply — you may choose multiple roles.</div>

            {/* Role selector pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
              {roles.map(role => {
                const sel = selectedRoles.includes(role.label)
                return (
                  <button key={role.id} onClick={() => toggleRole(role.label)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '12px 16px', borderRadius: 10, cursor: 'pointer', minWidth: 110,
                    background: sel ? 'rgba(132,204,22,.12)' : '#0f172a',
                    border: `2px solid ${sel ? '#84cc16' : '#334155'}`,
                    color: sel ? '#84cc16' : '#94a3b8',
                    transition: 'all .15s',
                  }}>
                    <span style={{ fontSize: 26 }}>{role.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{role.label}</span>
                    {role.subtitle && <span style={{ fontSize: 11, color: '#64748b', textAlign: 'center' }}>{role.subtitle}</span>}
                  </button>
                )
              })}
            </div>

            {/* Per-selected-role questions */}
            {selectedRoles.map(roleName => {
              const roleConfig = roles.find(r => r.label === roleName)
              if (!roleConfig || !roleConfig.questions || roleConfig.questions.length === 0) return null
              return (
                <div key={roleName} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '16px 18px', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, color: '#f1f5f9' }}>{roleConfig.emoji} {roleName}</div>
                  {roleConfig.questions.map(q => {
                    const val = roleData[roleName]?.[q.id]
                    if (q.type === 'text') {
                      return (
                        <div key={q.id} style={fieldWrap}>
                          <label style={labelSt}>{q.label}</label>
                          <input value={val || ''} onChange={e => setRoleAnswer(roleName, q.id, e.target.value)} style={inputSt} />
                        </div>
                      )
                    }
                    if (q.type === 'textarea') {
                      return (
                        <div key={q.id} style={fieldWrap}>
                          <label style={labelSt}>{q.label}</label>
                          <textarea value={val || ''} onChange={e => setRoleAnswer(roleName, q.id, e.target.value)} rows={3} style={{ ...inputSt, resize: 'vertical' }} />
                        </div>
                      )
                    }
                    if (q.type === 'url') {
                      return (
                        <div key={q.id} style={fieldWrap}>
                          <label style={labelSt}>{q.label}</label>
                          <input type="url" value={val || ''} onChange={e => setRoleAnswer(roleName, q.id, e.target.value)} placeholder="https://" style={inputSt} />
                        </div>
                      )
                    }
                    if (q.type === 'radio') {
                      return (
                        <div key={q.id} style={fieldWrap}>
                          <label style={labelSt}>{q.label}</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {(q.options || []).map(opt => (
                              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', background: val === opt ? 'rgba(132,204,22,.1)' : '#1e293b', border: `1px solid ${val === opt ? '#84cc16' : '#334155'}`, borderRadius: 6, padding: '5px 12px', color: val === opt ? '#84cc16' : '#f1f5f9' }}>
                                <input type="radio" name={`${roleName}-${q.id}`} value={opt} checked={val === opt} onChange={() => setRoleAnswer(roleName, q.id, opt)} style={{ display: 'none' }} />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    if (q.type === 'multicheck') {
                      const checked = Array.isArray(val) ? val : []
                      return (
                        <div key={q.id} style={fieldWrap}>
                          <label style={labelSt}>{q.label}</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {(q.options || []).map(opt => (
                              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', background: checked.includes(opt) ? 'rgba(132,204,22,.1)' : '#1e293b', border: `1px solid ${checked.includes(opt) ? '#84cc16' : '#334155'}`, borderRadius: 6, padding: '5px 12px', color: checked.includes(opt) ? '#84cc16' : '#f1f5f9' }}>
                                <input type="checkbox" checked={checked.includes(opt)} onChange={() => toggleRoleAnswerOption(roleName, q.id, opt)} style={{ display: 'none' }} />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    if (q.type === 'toggles') {
                      const checked = Array.isArray(val) ? val : []
                      return (
                        <div key={q.id} style={fieldWrap}>
                          <label style={labelSt}>{q.label}</label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(q.options || []).map(opt => (
                              <label key={opt} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '8px 12px', background: '#1e293b', borderRadius: 6, border: '1px solid #334155' }}>
                                <span style={{ fontSize: 13 }}>{opt}</span>
                                <div style={{ width: 36, height: 20, borderRadius: 10, background: checked.includes(opt) ? '#84cc16' : '#334155', position: 'relative', transition: 'background .15s', flexShrink: 0 }}
                                  onClick={() => toggleRoleAnswerOption(roleName, q.id, opt)}>
                                  <div style={{ position: 'absolute', top: 3, left: checked.includes(opt) ? 18 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              )
            })}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={() => setStep(0)} style={ghostBtn}>← Back</button>
              <button onClick={submitEntry} style={primaryBtn}>Complete Sign-Up</button>
            </div>
          </>
        )}

        {/* Step 2 — Done */}
        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#84cc16' }}>You're in!</div>
            <div style={{ fontSize: 15, color: '#94a3b8', marginBottom: 24 }}>
              Thanks, <strong style={{ color: '#f1f5f9' }}>{formData.name}</strong>! We'll be in touch.
            </div>
            {selectedRoles.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {selectedRoles.map(r => {
                  const role = roles.find(rl => rl.label === r)
                  return <span key={r} style={{ fontSize: 13, background: 'rgba(132,204,22,.12)', border: '1px solid rgba(132,204,22,.3)', borderRadius: 20, padding: '4px 14px', color: '#84cc16' }}>{role?.emoji} {r}</span>
                })}
              </div>
            )}
            <button onClick={() => nav('/')} style={ghostBtn}>← Back to Barbelo</button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 28, fontSize: 12, color: '#475569' }}>
        Powered by <span style={{ color: '#84cc16', fontWeight: 700 }}>Barbelo</span>
      </div>
    </div>
  )
}
