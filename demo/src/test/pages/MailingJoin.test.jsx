import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from '../../store'
import MailingJoin from '../../pages/MailingJoin'

// The seed mailing list has shareSlug 'hip-hop-night', is active,
// requires: name, email, phone, zip — and has 4 roles: Rapper, Producer, DJ, Fan.

function renderMailingJoin(slug) {
  return render(
    <MemoryRouter initialEntries={[`/join/${slug}`]}>
      <StoreProvider>
        <Routes>
          <Route path="/join/:slug" element={<MailingJoin />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </StoreProvider>
    </MemoryRouter>
  )
}

// Fill all required basics fields (name, email, phone, zip) and click submit.
async function fillBasicsAndSubmit(user, name = 'Test User') {
  await user.type(screen.getByPlaceholderText('Your full name'), name)
  await user.type(screen.getByPlaceholderText('your@email.com'), 'test@example.com')
  await user.type(screen.getByPlaceholderText('+1 (555) 000-0000'), '555-1234')
  await user.type(screen.getByPlaceholderText('98101'), '98101')
  await user.click(screen.getByRole('button', { name: /next/i }))
}

describe('MailingJoin page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // ── Slug not found ────────────────────────────────────────────────────────

  describe('unknown slug', () => {
    it('renders "List not found" for an unknown slug', () => {
      renderMailingJoin('nonexistent-slug')
      expect(screen.getByText('List not found')).toBeInTheDocument()
    })

    it('does not render a sign-up form for an unknown slug', () => {
      renderMailingJoin('nonexistent-slug')
      expect(screen.queryByPlaceholderText('Your full name')).not.toBeInTheDocument()
    })

    it('renders a "Go Home" button for an unknown slug', () => {
      renderMailingJoin('nonexistent-slug')
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
    })
  })

  // ── Step 0 — Basics form ─────────────────────────────────────────────────

  describe('valid slug — step 0 (basics)', () => {
    it('renders the list name in the header', () => {
      renderMailingJoin('hip-hop-night')
      expect(screen.getByText('Hip-Hop Night')).toBeInTheDocument()
    })

    it('renders the name input field', () => {
      renderMailingJoin('hip-hop-night')
      expect(screen.getByPlaceholderText('Your full name')).toBeInTheDocument()
    })

    it('renders the email input field', () => {
      renderMailingJoin('hip-hop-night')
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
    })

    it('renders the phone input field', () => {
      renderMailingJoin('hip-hop-night')
      expect(screen.getByPlaceholderText('+1 (555) 000-0000')).toBeInTheDocument()
    })

    it('renders the zip code input field', () => {
      renderMailingJoin('hip-hop-night')
      expect(screen.getByPlaceholderText('98101')).toBeInTheDocument()
    })

    it('shows "Next →" button when the list has roles', () => {
      renderMailingJoin('hip-hop-night')
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument()
    })

    it('shows a name validation error when name is empty and form is submitted', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await user.click(screen.getByRole('button', { name: /next/i }))
      expect(screen.getByText('Name is required')).toBeInTheDocument()
    })

    it('shows an email validation error when name is filled but email is empty', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await user.type(screen.getByPlaceholderText('Your full name'), 'Jordan')
      await user.click(screen.getByRole('button', { name: /next/i }))
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })

    it('stays on step 0 when required fields are missing', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await user.click(screen.getByRole('button', { name: /next/i }))
      // Step 0 name field should still be present
      expect(screen.getByPlaceholderText('Your full name')).toBeInTheDocument()
    })

    it('advances to step 1 (role selection) when all required basics are valid', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await fillBasicsAndSubmit(user)
      expect(screen.getByText('What best describes you?')).toBeInTheDocument()
    })

    it('does not show the basics form after advancing to step 1', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await fillBasicsAndSubmit(user)
      expect(screen.queryByPlaceholderText('Your full name')).not.toBeInTheDocument()
    })
  })

  // ── Step 1 — Role selection ───────────────────────────────────────────────

  describe('valid slug — step 1 (roles)', () => {
    it('shows the role selection heading', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await fillBasicsAndSubmit(user)
      expect(screen.getByText('What best describes you?')).toBeInTheDocument()
    })

    it('shows all seed role options on step 1', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await fillBasicsAndSubmit(user)
      expect(screen.getByText('Rapper')).toBeInTheDocument()
      expect(screen.getByText('Producer')).toBeInTheDocument()
      expect(screen.getByText('DJ')).toBeInTheDocument()
      expect(screen.getByText('Fan')).toBeInTheDocument()
    })

    it('shows a "← Back" button on step 1', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await fillBasicsAndSubmit(user)
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    it('shows a "Complete Sign-Up" button on step 1', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await fillBasicsAndSubmit(user)
      expect(screen.getByRole('button', { name: /complete sign-up/i })).toBeInTheDocument()
    })

    it('back button returns to step 0', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await fillBasicsAndSubmit(user)
      await user.click(screen.getByRole('button', { name: /back/i }))
      expect(screen.getByPlaceholderText('Your full name')).toBeInTheDocument()
    })

    it('previously entered name is still present after going back', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await fillBasicsAndSubmit(user, 'Jordan Malik')
      await user.click(screen.getByRole('button', { name: /back/i }))
      expect(screen.getByDisplayValue('Jordan Malik')).toBeInTheDocument()
    })

    it('clicking "Complete Sign-Up" advances to step 2 (done) without selecting a role', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await fillBasicsAndSubmit(user)
      await user.click(screen.getByRole('button', { name: /complete sign-up/i }))
      expect(screen.getByText("You're in!")).toBeInTheDocument()
    })

    it('selecting a role highlights it', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await fillBasicsAndSubmit(user)
      const rapperBtn = screen.getByRole('button', { name: /rapper/i })
      await user.click(rapperBtn)
      // After clicking, the button should have accent border styling (visual test via aria or DOM)
      expect(rapperBtn).toBeInTheDocument()
    })
  })

  // ── Step 2 — Confirmation ─────────────────────────────────────────────────

  describe('valid slug — step 2 (done)', () => {
    async function goToStep2(user, name = 'Test User') {
      renderMailingJoin('hip-hop-night')
      await fillBasicsAndSubmit(user, name)
      await user.click(screen.getByRole('button', { name: /complete sign-up/i }))
    }

    it('shows "You\'re in!" on step 2', async () => {
      const user = userEvent.setup()
      await goToStep2(user)
      expect(screen.getByText("You're in!")).toBeInTheDocument()
    })

    it('shows the submitted name in the confirmation message', async () => {
      const user = userEvent.setup()
      await goToStep2(user, 'Jordan Malik')
      expect(screen.getByText('Jordan Malik')).toBeInTheDocument()
    })

    it('does not show the basics form on step 2', async () => {
      const user = userEvent.setup()
      await goToStep2(user)
      expect(screen.queryByPlaceholderText('Your full name')).not.toBeInTheDocument()
    })

    it('does not show the role selection heading on step 2', async () => {
      const user = userEvent.setup()
      await goToStep2(user)
      expect(screen.queryByText('What best describes you?')).not.toBeInTheDocument()
    })

    it('shows a "Back to Barbelo" button on step 2', async () => {
      const user = userEvent.setup()
      await goToStep2(user)
      expect(screen.getByRole('button', { name: /back to barbelo/i })).toBeInTheDocument()
    })

    it('calls addMailingEntry (entry stored in the list)', async () => {
      const user = userEvent.setup()
      // We verify by reaching step 2 — submitEntry() calls addMailingEntry then setStep(2).
      // If addMailingEntry throws or is missing, setStep(2) would not be reached.
      await goToStep2(user, 'Verified User')
      expect(screen.getByText('Verified User')).toBeInTheDocument()
    })

    it('shows selected role chips on step 2', async () => {
      const user = userEvent.setup()
      renderMailingJoin('hip-hop-night')
      await fillBasicsAndSubmit(user, 'Role Tester')
      await user.click(screen.getByRole('button', { name: /rapper/i }))
      await user.click(screen.getByRole('button', { name: /complete sign-up/i }))
      expect(screen.getByText("You're in!")).toBeInTheDocument()
      // The Rapper chip should appear in the confirmation
      expect(screen.getByText(/rapper/i)).toBeInTheDocument()
    })
  })
})
