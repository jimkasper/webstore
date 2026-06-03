import { useState, useMemo } from 'react'
import { useStore } from '../../store'

const LIFE_APPS = [
  { key: 'fitness',   label: '💪 Fitness' },
  { key: 'health',    label: '🏥 Health' },
  { key: 'financial', label: '💰 Financial' },
  { key: 'diet',      label: '🥗 Diet' },
  { key: 'journal',   label: '📓 Journal' },
  { key: 'media',     label: '🎬 Media' },
  { key: 'learning',  label: '🎓 Learning' },
]

// App × type → array of metric options
const APP_METRICS = {
  fitness: {
    frequency: [
      { id: 'workouts',          label: 'Workouts per week',              unit: 'sessions', icon: '🏋️', placeholder: '3',    desc: 'Any workout logged in Fitness' },
      { id: 'runs',              label: 'Running sessions',               unit: 'runs',     icon: '🏃', placeholder: '2',    desc: 'Run events logged in Fitness' },
      { id: 'strength_sessions', label: 'Strength / lifting sessions',    unit: 'sessions', icon: '💪', placeholder: '3',    desc: 'Dedicated strength or lifting sessions' },
      { id: 'cardio_sessions',   label: 'Cardio sessions',                unit: 'sessions', icon: '❤️', placeholder: '2',    desc: 'Dedicated cardio workouts (bike, swim, row, etc.)' },
      { id: 'duration',          label: 'Total training time',            unit: 'hours',    icon: '⏱',  placeholder: '5',    desc: 'Combined hours across all sessions' },
      { id: 'calories',          label: 'Calories burned',                unit: 'kcal',     icon: '🔥', placeholder: '1500', desc: 'Total calories across all sessions' },
      { id: 'active_days',       label: 'Active days',                    unit: 'days',     icon: '✅', placeholder: '5',    desc: 'Days with any logged activity' },
    ],
    milestone: [
      { id: 'distance',          label: 'Run a target distance',          unit: 'km',       icon: '🗺',  placeholder: '5',   desc: 'Best single-run distance logged' },
      { id: 'race_time',         label: 'Finish a race in a target time', unit: 'min',      icon: '⏱',  placeholder: '30',  desc: 'Finish time for a specific race distance (e.g. sub-30 min 5K)' },
      { id: 'weight',            label: 'Lift a target weight',           unit: 'lbs',      icon: '🏋️', placeholder: '225', desc: 'Personal best for a specific lift (squat, deadlift, bench, etc.)' },
      { id: 'bodyweight_reps',   label: 'Hit a bodyweight rep milestone', unit: 'reps',     icon: '💪', placeholder: '20',  desc: 'e.g. 20 pull-ups, 100 push-ups, 50 dips in a single set' },
      { id: 'cycle_distance',    label: 'Ride a target distance',         unit: 'km',       icon: '🚴', placeholder: '100', desc: 'Best single-ride distance (road, mountain, or indoor)' },
      { id: 'swim_distance',     label: 'Swim a target distance',         unit: 'm',        icon: '🏊', placeholder: '1000', desc: 'Best single-swim distance logged' },
      { id: 'elevation',         label: 'Hike a target elevation gain',   unit: 'ft',       icon: '⛰️', placeholder: '5000', desc: 'Total elevation gained on a single outing or hike' },
      { id: 'race',              label: 'Complete a race or event',       unit: 'events',   icon: '🏅', placeholder: '1',   desc: 'Finish an official race, obstacle course, or challenge event' },
      { id: 'triathlon',         label: 'Complete a triathlon',           unit: 'events',   icon: '🥇', placeholder: '1',   desc: 'Sprint, Olympic, Half-Iron, or Ironman triathlon' },
      { id: 'skill_move',        label: 'Master a movement or skill',     unit: 'milestone',icon: '⭐', placeholder: '1',   desc: 'e.g. handstand, muscle-up, first unassisted pull-up, splits' },
      { id: 'season',            label: 'Complete a sport season',        unit: 'seasons',  icon: '🏆', placeholder: '1',   desc: 'Finish a full competitive season of a team or individual sport' },
    ],
    threshold: [
      { id: 'session_duration',  label: 'Session duration',               unit: 'min',      icon: '⏱',  placeholder: '30',  desc: 'Duration of a single workout or activity session' },
      { id: 'active_days_wk',    label: 'Active days per week',           unit: 'days/wk',  icon: '📅', placeholder: '4',   desc: 'Days with any logged activity in a 7-day window' },
      { id: 'rest_streak',       label: 'Consecutive rest days',          unit: 'days',     icon: '⛔', placeholder: '2',   desc: 'Back-to-back days with no logged activity' },
      { id: 'daily_steps',       label: 'Daily step count',               unit: 'steps',    icon: '👟', placeholder: '8000', desc: 'Step count from a wearable or phone pedometer' },
      { id: 'weekly_volume',     label: 'Weekly training volume',         unit: 'min/wk',   icon: '⌛', placeholder: '180', desc: 'Total workout minutes across an entire week' },
    ],
    habit: [
      { id: 'daily_move',        label: 'Daily movement',                 unit: 'days',     icon: '🚶', placeholder: '', desc: 'Log any activity — even a walk — every day' },
      { id: 'stretch',           label: 'Daily stretch / mobility',       unit: 'days',     icon: '🧘', placeholder: '', desc: 'Mobility, flexibility, or yoga work each day' },
      { id: 'morning_workout',   label: 'Morning workout',                unit: 'days',     icon: '🌅', placeholder: '', desc: 'Complete a workout before noon' },
      { id: 'recovery',          label: 'Daily recovery work',            unit: 'days',     icon: '🛁', placeholder: '', desc: 'Foam rolling, ice bath, sauna, or structured recovery' },
    ],
  },
  health: {
    frequency: [
      { id: 'sleep_hrs',         label: 'Nights with 7+ hours sleep',    unit: 'nights',   icon: '😴', placeholder: '5',   desc: 'Nights logged ≥7h in Health' },
      { id: 'water_days',        label: 'Days hitting water goal',        unit: 'days',     icon: '💧', placeholder: '5',   desc: 'Days with 8+ glasses of water logged' },
      { id: 'step_days',         label: 'Days hitting step goal',         unit: 'days',     icon: '👟', placeholder: '5',   desc: 'Days with 10,000+ steps logged' },
      { id: 'logs',              label: 'Health check-ins',               unit: 'logs',     icon: '📋', placeholder: '3',   desc: 'Any health metric logged (weight, HR, etc.)' },
      { id: 'therapy_sessions',  label: 'Therapy / counseling sessions',  unit: 'sessions', icon: '🧠', placeholder: '4',   desc: 'Mental health appointments per month' },
    ],
    milestone: [
      { id: 'weight_goal',       label: 'Reach target body weight',       unit: 'lbs',      icon: '⚖️', placeholder: '175', desc: 'Body weight logged in Health' },
      { id: 'hr_goal',           label: 'Reach resting heart rate target', unit: 'bpm',     icon: '❤️', placeholder: '60',  desc: 'Resting HR logged in Health' },
      { id: 'blood_pressure',    label: 'Reach target blood pressure',    unit: 'mmHg',     icon: '💉', placeholder: '120', desc: 'Systolic reading (top number) target' },
      { id: 'smoke_free',        label: 'Smoke-free streak',              unit: 'days',     icon: '🚭', placeholder: '365', desc: 'Consecutive days without smoking or vaping' },
      { id: 'alcohol_free',      label: 'Alcohol-free streak',            unit: 'days',     icon: '🧃', placeholder: '90',  desc: 'Consecutive days without alcohol' },
      { id: 'steps_milestone',   label: 'Cumulative steps milestone',     unit: 'k steps',  icon: '👟', placeholder: '1000', desc: 'Total steps logged (e.g. 1 million = 1000k)' },
      { id: 'checkup',           label: 'Complete annual health screening', unit: 'checkups', icon: '🏥', placeholder: '1', desc: 'Annual physical, dental, eye, and specialist exams' },
      { id: 'therapy_program',   label: 'Complete a therapy program',     unit: 'sessions', icon: '🧠', placeholder: '12',  desc: 'Finish a full course of therapy or counseling' },
      { id: 'hrv_target',        label: 'Reach HRV target',               unit: 'ms',       icon: '📈', placeholder: '60',  desc: 'Heart-rate variability as measured by wearable' },
    ],
    threshold: [
      { id: 'sleep_hours',       label: 'Nightly sleep',                  unit: 'hrs/night', icon: '🌙', placeholder: '7',  desc: 'Hours of sleep logged per night' },
      { id: 'alcohol_drinks',    label: 'Weekly alcohol intake',          unit: 'drinks/wk', icon: '🍺', placeholder: '7',  desc: 'Standard drink count across a 7-day period (1 drink ≈ 12 oz beer, 5 oz wine, or 1.5 oz spirits)' },
      { id: 'caffeine_mg',       label: 'Daily caffeine intake',          unit: 'mg/day',   icon: '☕', placeholder: '400', desc: 'Milligrams of caffeine consumed per day (8 oz coffee ≈ 95 mg)' },
      { id: 'pre_sleep_screen',  label: 'Pre-sleep screen time',          unit: 'min',      icon: '📵', placeholder: '60',  desc: 'Minutes spent on screens immediately before bed' },
      { id: 'resting_hr',        label: 'Resting heart rate',             unit: 'bpm',      icon: '❤️', placeholder: '65',  desc: 'Resting HR reading logged in Health' },
    ],
    habit: [
      { id: 'log_daily',         label: 'Log health metrics daily',       unit: 'days',     icon: '📊', placeholder: '', desc: 'Any entry in Health each day' },
      { id: 'meditate',          label: 'Meditate daily',                 unit: 'days',     icon: '🧘', placeholder: '', desc: 'Mindfulness or meditation session each day' },
      { id: 'supplements',       label: 'Take supplements daily',         unit: 'days',     icon: '💊', placeholder: '', desc: 'Log supplement intake each day' },
      { id: 'sunlight',          label: 'Morning sunlight daily',         unit: 'days',     icon: '☀️', placeholder: '', desc: 'At least 10 minutes of natural light in the morning' },
      { id: 'breathwork',        label: 'Breathwork or cold exposure',    unit: 'days',     icon: '🫁', placeholder: '', desc: 'Breathing protocol, cold shower, sauna, or ice bath' },
    ],
  },
  financial: {
    frequency: [
      { id: 'deposits',          label: 'Savings deposits',               unit: 'transfers', icon: '💰', placeholder: '4',  desc: 'Transfers to savings or investment account' },
      { id: 'reviews',           label: 'Budget reviews',                 unit: 'reviews',  icon: '📊', placeholder: '1',   desc: 'Full budget check-in sessions logged' },
      { id: 'debt_pmt',          label: 'Debt payments',                  unit: 'payments', icon: '💳', placeholder: '1',   desc: 'Scheduled debt payments made' },
      { id: 'invest_contrib',    label: 'Investment contributions',       unit: 'deposits',  icon: '📈', placeholder: '1',   desc: 'Monthly contributions to 401k, IRA, or brokerage' },
      { id: 'income_logs',       label: 'Income entries tracked',         unit: 'entries',  icon: '💵', placeholder: '4',   desc: 'New income sources or payments logged' },
    ],
    milestone: [
      { id: 'savings_amt',       label: 'Save a target amount',           unit: '$',        icon: '🏦', placeholder: '5000',  desc: 'Total saved toward a specific goal (vacation, down payment, etc.)' },
      { id: 'emergency_fund',    label: 'Build emergency fund',           unit: 'months',   icon: '🛡️', placeholder: '6',    desc: 'Months of living expenses saved in a liquid account' },
      { id: 'debt_free',         label: 'Pay off a specific debt',        unit: '$',        icon: '🆓', placeholder: '3000',  desc: 'Remaining balance to eliminate (credit card, student loan, etc.)' },
      { id: 'net_worth',         label: 'Net worth milestone',            unit: '$',        icon: '📈', placeholder: '50000', desc: 'Total assets minus liabilities' },
      { id: 'invest_balance',    label: 'Reach investment balance',       unit: '$',        icon: '📊', placeholder: '100000', desc: 'Target balance across retirement and investment accounts' },
      { id: 'income_target',     label: 'Hit monthly income target',      unit: '$/mo',     icon: '💵', placeholder: '5000',  desc: 'Gross monthly income from all sources' },
      { id: 'side_income',       label: 'Side income milestone',          unit: '$/mo',     icon: '💼', placeholder: '1000',  desc: 'Monthly income from side project, freelance, or investment' },
      { id: 'credit_score',      label: 'Reach target credit score',      unit: 'pts',      icon: '⭐', placeholder: '750',   desc: 'FICO or VantageScore target' },
      { id: 'giving_target',     label: 'Donate a target amount',         unit: '$',        icon: '🤝', placeholder: '1000',  desc: 'Total charitable giving toward a goal' },
      { id: 'purchase_fund',     label: 'Save for a specific purchase',   unit: '$',        icon: '🎯', placeholder: '3000',  desc: 'Dedicated savings toward a car, home appliance, travel, etc.' },
    ],
    threshold: [
      { id: 'category_spend',    label: 'Category spending',              unit: '$/period', icon: '💳', placeholder: '500',  desc: 'Spending in a specific budget category — name the category in your goal title' },
      { id: 'total_expenses',    label: 'Total monthly expenses',         unit: '$/month',  icon: '💸', placeholder: '3000', desc: 'Sum of all outgoing transactions in a calendar month' },
      { id: 'food_spend',        label: 'Food & dining spending',         unit: '$/month',  icon: '🛒', placeholder: '600',  desc: 'Groceries plus restaurant, delivery, and coffee shop transactions' },
      { id: 'subscription_cost', label: 'Recurring subscription cost',    unit: '$/month',  icon: '📱', placeholder: '100',  desc: 'Total of all recurring digital and media subscriptions' },
      { id: 'transport_spend',   label: 'Transport spending',             unit: '$/month',  icon: '🚗', placeholder: '400',  desc: 'Gas, transit, parking, and ride-share transactions combined' },
      { id: 'impulse_spend',     label: 'Unplanned purchase spending',    unit: '$/month',  icon: '🛍',  placeholder: '100', desc: 'Purchases flagged as unbudgeted or impulse buys' },
    ],
    habit: [
      { id: 'track_daily',       label: 'Log every expense',              unit: 'days',     icon: '✍️', placeholder: '', desc: 'Add every transaction the day it happens' },
      { id: 'no_impulse',        label: 'No impulse purchases',           unit: 'days',     icon: '🛑', placeholder: '', desc: 'Only buy from a pre-decided list' },
      { id: 'weekly_review',     label: 'Weekly budget check-in',         unit: 'weeks',    icon: '📋', placeholder: '', desc: 'Review spending vs. plan every week' },
      { id: 'no_online_shop',    label: 'No unplanned online shopping',   unit: 'days',     icon: '🚫', placeholder: '', desc: 'Online purchases only from a pre-approved list' },
    ],
  },
  diet: {
    frequency: [
      { id: 'meals_logged',      label: 'Meals logged per day',           unit: 'meals/day', icon: '🥗', placeholder: '3',  desc: 'Complete meal entries logged in Diet' },
      { id: 'water',             label: 'Days hitting water goal',        unit: 'days',     icon: '💧', placeholder: '5',   desc: 'Days with 8+ glasses logged' },
      { id: 'veggie_days',       label: 'Days with vegetables',           unit: 'days',     icon: '🥦', placeholder: '5',   desc: 'Days with at least one vegetable serving' },
      { id: 'alcohol_free_days', label: 'Alcohol-free days',              unit: 'days',     icon: '🧃', placeholder: '5',   desc: 'Days without any alcohol' },
      { id: 'home_cooked',       label: 'Home-cooked dinners',            unit: 'meals',    icon: '🍳', placeholder: '5',   desc: 'Dinners cooked at home per week' },
      { id: 'meal_prep',         label: 'Meal-prep sessions',             unit: 'sessions', icon: '📦', placeholder: '2',   desc: 'Batch cooking or prep sessions per week' },
    ],
    milestone: [
      { id: 'cal_target',        label: 'Hit daily calorie target (avg)', unit: 'kcal',     icon: '🔥', placeholder: '2000', desc: 'Average calories logged over the goal period' },
      { id: 'protein_goal',      label: 'Hit protein target (avg)',       unit: 'g/day',    icon: '🥩', placeholder: '150',  desc: 'Average protein intake over the goal period' },
      { id: 'fiber_target',      label: 'Hit daily fiber target (avg)',   unit: 'g/day',    icon: '🌾', placeholder: '30',   desc: 'Average dietary fiber intake per day' },
      { id: 'hydration_target',  label: 'Hit daily hydration target (avg)', unit: 'oz/day', icon: '💧', placeholder: '64',  desc: 'Average water intake per day' },
      { id: 'diet_challenge',    label: 'Complete a dietary challenge',   unit: 'days',     icon: '🏆', placeholder: '30',   desc: 'e.g. Whole30, sugar-free month, 30 days plant-based' },
      { id: 'alcohol_free_streak', label: 'Alcohol-free streak',          unit: 'days',     icon: '🧃', placeholder: '30',   desc: 'Consecutive days without any alcohol' },
      { id: 'home_cooked_streak', label: 'Home-cooked meals streak',      unit: 'days',     icon: '🍳', placeholder: '30',   desc: 'Consecutive days cooking dinner at home' },
      { id: 'macro_split',       label: 'Achieve target macro split',     unit: '% protein', icon: '📊', placeholder: '30', desc: 'Target percentage of calories from protein' },
    ],
    threshold: [
      { id: 'daily_calories',    label: 'Daily calorie intake',           unit: 'kcal/day', icon: '🔥', placeholder: '2200', desc: 'Total calories across all meals logged per day' },
      { id: 'daily_sugar',       label: 'Daily sugar intake',             unit: 'g/day',    icon: '🍭', placeholder: '50',   desc: 'Total sugar across all logged meals per day' },
      { id: 'daily_sodium',      label: 'Daily sodium intake',            unit: 'mg/day',   icon: '🧂', placeholder: '2300', desc: 'Total sodium logged per day (1 tsp salt ≈ 2300 mg)' },
      { id: 'daily_fat',         label: 'Daily fat intake',               unit: 'g/day',    icon: '🧈', placeholder: '65',   desc: 'Total dietary fat across all meals per day' },
      { id: 'weekly_alcohol',    label: 'Weekly alcohol intake',          unit: 'drinks/wk', icon: '🍺', placeholder: '7',  desc: 'Standard drinks counted across an entire week' },
      { id: 'meals_out',         label: 'Meals eaten out per week',       unit: 'meals/wk', icon: '🍽',  placeholder: '3',  desc: 'Restaurant or delivery meals logged in a week' },
    ],
    habit: [
      { id: 'log_meals',         label: 'Log all meals every day',        unit: 'days',     icon: '📝', placeholder: '', desc: 'Three or more entries per day minimum' },
      { id: 'no_late',           label: 'No eating after 9 PM',           unit: 'days',     icon: '🌙', placeholder: '', desc: 'Close the kitchen — nothing after 9pm' },
      { id: 'morning_water',     label: 'Water before coffee or phone',   unit: 'days',     icon: '💧', placeholder: '', desc: 'Drink 16 oz of water first thing each morning' },
      { id: 'veggie_every_meal', label: 'Vegetable at every meal',        unit: 'days',     icon: '🥦', placeholder: '', desc: 'At least one veggie serving at every meal' },
      { id: 'alcohol_free_weekdays', label: 'Alcohol-free weekdays',      unit: 'days',     icon: '🧃', placeholder: '', desc: 'No alcohol Monday through Friday' },
    ],
  },
  journal: {
    frequency: [
      { id: 'entries',           label: 'Journal entries',                unit: 'entries',  icon: '📓', placeholder: '5',  desc: 'Any journal entry logged' },
      { id: 'mood_logs',         label: 'Mood check-ins',                 unit: 'logs',     icon: '😊', placeholder: '7',  desc: 'Days with a day rating logged' },
      { id: 'weekly_review',     label: 'Weekly review sessions',         unit: 'reviews',  icon: '🔍', placeholder: '1',  desc: 'Full weekly reflection sessions completed' },
      { id: 'gratitude_logs',    label: 'Gratitude list entries',         unit: 'entries',  icon: '🙏', placeholder: '5',  desc: 'Days with a gratitude list written' },
      { id: 'prompts',           label: 'Deep-reflection prompts answered', unit: 'prompts', icon: '💭', placeholder: '3', desc: 'Specific journaling prompts completed per week' },
    ],
    milestone: [
      { id: 'total_entries',     label: 'Total entries written',          unit: 'entries',  icon: '📚', placeholder: '52',    desc: 'Cumulative journal entries' },
      { id: 'streak',            label: 'Writing streak',                 unit: 'days',     icon: '🔥', placeholder: '30',    desc: 'Consecutive days with at least one entry' },
      { id: 'total_words',       label: 'Total words written',            unit: 'words',    icon: '✍️', placeholder: '50000', desc: 'Cumulative word count across all entries' },
      { id: 'journal_challenge', label: 'Complete a journaling challenge', unit: 'days',    icon: '🏆', placeholder: '30',    desc: 'e.g. 30 days of morning pages, 100-day journal, 1-year daily' },
      { id: 'gratitude_streak',  label: 'Gratitude practice streak',      unit: 'days',     icon: '🙏', placeholder: '30',    desc: 'Consecutive days with a gratitude list' },
      { id: 'annual_review',     label: 'Complete annual review',         unit: 'reviews',  icon: '📅', placeholder: '1',     desc: 'Full year-in-review written and completed' },
      { id: 'project',           label: 'Complete a writing project',     unit: 'projects', icon: '📖', placeholder: '1',     desc: 'e.g. memoir, life story chapter, letter series, personal essay' },
    ],
    threshold: [
      { id: 'mood_average',      label: 'Mood rating average',            unit: '/5',       icon: '🌟', placeholder: '3.5', desc: 'Rolling average of daily mood scores logged in Journal' },
      { id: 'entry_word_count',  label: 'Entry word count',               unit: 'words',    icon: '📝', placeholder: '200', desc: 'Word count of a single journal entry' },
      { id: 'days_between',      label: 'Days between entries',           unit: 'days',     icon: '📅', placeholder: '3',   desc: 'Gap in days between consecutive journal entries' },
    ],
    habit: [
      { id: 'daily_entry',       label: 'Write every day',                unit: 'days',     icon: '✍️', placeholder: '', desc: 'At least one journal entry per day' },
      { id: 'highlight',         label: 'Daily highlight',                unit: 'days',     icon: '✨', placeholder: '', desc: 'Log one win or highlight each day' },
      { id: 'morning_pages',     label: 'Morning pages',                  unit: 'days',     icon: '🌅', placeholder: '', desc: 'Three pages of stream-of-consciousness writing each morning' },
      { id: 'evening_reflection', label: 'Evening reflection',            unit: 'days',     icon: '🌙', placeholder: '', desc: 'Brief reflection on the day each evening before bed' },
      { id: 'gratitude',         label: 'Gratitude practice',             unit: 'days',     icon: '🙏', placeholder: '', desc: 'Write three things you\'re grateful for each day' },
    ],
  },
  media: {
    frequency: [
      { id: 'books_read',        label: 'Books read',                     unit: 'books',    icon: '📚', placeholder: '1',  desc: 'Books marked completed in Media' },
      { id: 'films',             label: 'Films watched',                  unit: 'films',    icon: '🎬', placeholder: '2',  desc: 'Films marked completed' },
      { id: 'episodes',          label: 'Podcast episodes',               unit: 'episodes', icon: '🎧', placeholder: '4',  desc: 'Podcast episodes completed' },
      { id: 'albums',            label: 'Albums listened',                unit: 'albums',   icon: '🎵', placeholder: '4',  desc: 'Albums listened start-to-finish (not shuffle)' },
      { id: 'articles',          label: 'Articles or long-form essays',   unit: 'articles', icon: '📰', placeholder: '5',  desc: 'Long-form reads completed per week' },
      { id: 'docs',              label: 'Documentaries watched',          unit: 'docs',     icon: '🎞',  placeholder: '2', desc: 'Documentaries or educational films' },
    ],
    milestone: [
      { id: 'total_books',       label: 'Total books this year',          unit: 'books',    icon: '📖', placeholder: '12',  desc: 'Books completed in calendar year' },
      { id: 'total_films',       label: 'Total films this year',          unit: 'films',    icon: '🎞',  placeholder: '24', desc: 'Films completed in calendar year' },
      { id: 'total_albums',      label: 'Total albums this year',         unit: 'albums',   icon: '🎵', placeholder: '52',  desc: 'Albums listened start-to-finish this year' },
      { id: 'reading_challenge', label: 'Complete a reading challenge',   unit: 'books',    icon: '🏆', placeholder: '52',  desc: 'e.g. 52-book challenge, diverse-authors challenge, genre bingo' },
      { id: 'genre_books',       label: 'Books in a specific genre or subject', unit: 'books', icon: '📚', placeholder: '10', desc: 'e.g. all the classics, history books, biographies' },
      { id: 'series_completion', label: 'Finish a book or film series',   unit: 'volumes',  icon: '📚', placeholder: '5',   desc: 'Read all volumes of a series or watch all films in a franchise' },
      { id: 'podcast_series',    label: 'Complete a podcast series',      unit: 'series',   icon: '🎧', placeholder: '1',   desc: 'Listen through an entire podcast series start to finish' },
      { id: 'tv_seasons',        label: 'TV seasons completed',           unit: 'seasons',  icon: '📺', placeholder: '3',   desc: 'Full television seasons watched' },
      { id: 'foreign_lang_media', label: 'Immersion media in target language', unit: 'hours', icon: '🌍', placeholder: '20', desc: 'Films, shows, podcasts, or books in the language you\'re learning' },
      { id: 'total_articles',    label: 'Long-form articles this year',   unit: 'articles', icon: '📰', placeholder: '100', desc: 'Long-form reads completed in calendar year' },
    ],
    threshold: [
      { id: 'daily_screen_time', label: 'Daily screen time',              unit: 'hrs/day',  icon: '📺', placeholder: '2',   desc: 'Total passive screen consumption per day' },
      { id: 'social_media_use',  label: 'Social media use',               unit: 'min/day',  icon: '📱', placeholder: '30',  desc: 'Combined time across all social platforms per day' },
      { id: 'phone_pickups',     label: 'Phone pickups',                  unit: 'count/day', icon: '📵', placeholder: '30', desc: 'Number of times the phone is picked up in a day' },
    ],
    habit: [
      { id: 'read_daily',        label: 'Read every day',                 unit: 'days',     icon: '📖', placeholder: '', desc: 'Any reading session logged — even 10 minutes counts' },
      { id: 'no_doom',           label: 'No passive scrolling',           unit: 'days',     icon: '🚫', placeholder: '', desc: 'Intentional media use only — no mindless feed-scrolling' },
      { id: 'analog_first',      label: 'Analog before digital (morning)', unit: 'days',    icon: '☀️', placeholder: '', desc: 'No phone or screens for the first 30 minutes of the day' },
      { id: 'curated_listen',    label: 'Intentional music / podcast session', unit: 'days', icon: '🎵', placeholder: '', desc: 'One intentional listening session (not background noise) per day' },
      { id: 'no_phone_morning',  label: 'No phone for first hour of day', unit: 'days',     icon: '📵', placeholder: '', desc: 'Phone stays face-down or off for 60 minutes after waking' },
    ],
  },
  learning: {
    frequency: [
      { id: 'sessions',          label: 'Study or practice sessions',     unit: 'sessions', icon: '🎓', placeholder: '3',  desc: 'Any learning session logged' },
      { id: 'practice',          label: 'Deliberate practice sessions',   unit: 'sessions', icon: '🎯', placeholder: '5',  desc: 'Focused practice for a skill (instrument, language, craft, sport)' },
      { id: 'lessons',           label: 'Lessons or modules completed',   unit: 'lessons',  icon: '📚', placeholder: '5',  desc: 'Individual lessons, videos, or modules finished' },
      { id: 'flashcards',        label: 'Flashcard / spaced-repetition reviews', unit: 'reviews', icon: '🃏', placeholder: '50', desc: 'Daily card reviews in Anki, Duolingo, or similar' },
      { id: 'skills_lvl',        label: 'Skill level-ups',                unit: 'levels',   icon: '📈', placeholder: '1',  desc: 'Skills leveled up in Learning' },
    ],
    milestone: [
      { id: 'course',            label: 'Complete a course',              unit: 'courses',  icon: '🏅', placeholder: '1', desc: 'Finish a course, curriculum, or structured program' },
      { id: 'certification',     label: 'Pass a certification exam',      unit: 'certs',    icon: '🎓', placeholder: '1', desc: 'e.g. AWS, PMP, CPA, Google, CompTIA, language proficiency exam' },
      { id: 'bootcamp',          label: 'Complete a bootcamp or intensive', unit: 'programs', icon: '🏋️', placeholder: '1', desc: 'Finish a structured intensive program or immersive bootcamp' },
      { id: 'skill_level',       label: 'Reach a skill level',            unit: '/10 level', icon: '⭐', placeholder: '7', desc: 'Target level for a specific skill in Learning' },
      { id: 'portfolio_project', label: 'Build and ship a portfolio project', unit: 'projects', icon: '🚀', placeholder: '1', desc: 'Create and publish a project that demonstrates your new skills' },
      { id: 'language_level',    label: 'Reach language fluency level',   unit: 'CEFR level', icon: '🗣️', placeholder: 'B1', desc: 'Target CEFR level: A1 (beginner) → A2 → B1 → B2 → C1 → C2 (fluent)' },
      { id: 'talk',              label: 'Give a talk or presentation',    unit: 'talks',    icon: '🎤', placeholder: '1', desc: 'Present what you\'ve learned at a meetup, team standup, or conference' },
      { id: 'subject_books',     label: 'Read deeply on a subject',       unit: 'books',    icon: '📚', placeholder: '5', desc: 'Read N books specifically on one topic or discipline' },
      { id: 'degree',            label: 'Complete a degree or program',   unit: 'degrees',  icon: '🎓', placeholder: '1', desc: 'Finish a formal degree, diploma, or accredited multi-year program' },
      { id: 'teach',             label: 'Teach or mentor others',         unit: 'sessions', icon: '👨‍🏫', placeholder: '10', desc: 'Sessions spent teaching, tutoring, or mentoring someone else' },
    ],
    threshold: [
      { id: 'session_length',    label: 'Study session duration',         unit: 'min',      icon: '⏱',  placeholder: '20',  desc: 'Duration of a single study or deliberate practice session' },
      { id: 'days_between',      label: 'Days between sessions',          unit: 'days',     icon: '📅', placeholder: '2',   desc: 'Gap in days between consecutive learning sessions' },
      { id: 'weekly_practice',   label: 'Weekly practice time',           unit: 'min/wk',   icon: '⏰', placeholder: '120', desc: 'Total active learning minutes logged across a week' },
    ],
    habit: [
      { id: 'daily_learn',       label: 'Learn something every day',      unit: 'days',     icon: '💡', placeholder: '', desc: 'Any learning session logged — even 15 minutes counts' },
      { id: 'language',          label: 'Language practice daily',        unit: 'days',     icon: '🗣️', placeholder: '', desc: 'Daily language study or conversation practice' },
      { id: 'flashcard_daily',   label: 'Daily flashcard review',         unit: 'days',     icon: '🃏', placeholder: '', desc: 'Complete your spaced-repetition review deck every day' },
      { id: 'teach_habit',       label: 'Teach someone something weekly', unit: 'weeks',    icon: '👨‍🏫', placeholder: '', desc: 'Explain or demonstrate what you\'ve learned — teaching locks it in' },
      { id: 'deliberate',        label: 'Deliberate practice session',    unit: 'days',     icon: '🎯', placeholder: '', desc: 'Focused, uncomfortable practice — pushing past your current edge' },
    ],
  },
}

const PROOF_OPTIONS = [
  { key: 'habit_logged',     label: '✅ Habit logged',          desc: 'You mark it done in the app' },
  { key: 'location',         label: '📍 Location check-in',     desc: 'GPS confirms you were there' },
  { key: 'route_completion', label: '🗺 Route completion',      desc: 'GPS traces your full route' },
  { key: 'financial',        label: '💳 Financial transaction',  desc: 'Bank data confirms spend or earn' },
  { key: 'journal_written',  label: '📓 Journal entry',         desc: 'A journal entry is logged' },
]

const GOAL_TEMPLATES = [
  // ── Fitness & Health ──────────────────────────────────────────────────────
  { domain: 'Fitness & Health', icon: '🏃', name: 'Run a 5K',                  type: 'milestone',  period: 'weekly',   target: 5,    apps: ['fitness'],           proof: 'route_completion', metricId: 'distance',       unit: 'km',      suggestPlan: '5K Training Plan' },
  { domain: 'Fitness & Health', icon: '🏃', name: 'Sub-30 min 5K',             type: 'milestone',  period: 'monthly',  target: 30,   apps: ['fitness'],           proof: 'route_completion', metricId: 'race_time',      unit: 'min' },
  { domain: 'Fitness & Health', icon: '🏅', name: 'Run a half marathon',        type: 'milestone',  period: 'monthly',  target: 1,    apps: ['fitness'],           proof: 'route_completion', metricId: 'race',           unit: 'events',  suggestPlan: 'Half Marathon Plan' },
  { domain: 'Fitness & Health', icon: '🥇', name: 'Complete an Ironman',        type: 'milestone',  period: 'yearly',   target: 1,    apps: ['fitness'],           proof: 'route_completion', metricId: 'triathlon',      unit: 'events',  suggestPlan: 'Ironman Training Plan' },
  { domain: 'Fitness & Health', icon: '🏋️', name: 'Gym 3× per week',           type: 'frequency',  period: 'weekly',   target: 3,    apps: ['fitness'],           proof: 'location',         metricId: 'workouts',       unit: 'sessions' },
  { domain: 'Fitness & Health', icon: '💪', name: 'Bench press bodyweight',     type: 'milestone',  period: 'monthly',  target: 185,  apps: ['fitness'],           proof: 'habit_logged',     metricId: 'weight',         unit: 'lbs' },
  { domain: 'Fitness & Health', icon: '💪', name: '20 pull-ups',                type: 'milestone',  period: 'monthly',  target: 20,   apps: ['fitness'],           proof: 'habit_logged',     metricId: 'bodyweight_reps', unit: 'reps' },
  { domain: 'Fitness & Health', icon: '🚴', name: 'Cycle 100km (Century ride)', type: 'milestone',  period: 'monthly',  target: 100,  apps: ['fitness'],           proof: 'route_completion', metricId: 'cycle_distance', unit: 'km' },
  { domain: 'Fitness & Health', icon: '🏊', name: 'Swim 1km non-stop',          type: 'milestone',  period: 'monthly',  target: 1000, apps: ['fitness'],           proof: 'habit_logged',     metricId: 'swim_distance',  unit: 'm' },
  { domain: 'Fitness & Health', icon: '⛰️', name: 'Hike 5,000 ft elevation',   type: 'milestone',  period: 'monthly',  target: 5000, apps: ['fitness'],           proof: 'route_completion', metricId: 'elevation',      unit: 'ft' },
  { domain: 'Fitness & Health', icon: '🧘', name: 'Meditate daily',             type: 'habit',      period: 'weekly',   target: 1,    apps: ['health'],            proof: 'habit_logged',     metricId: 'meditate',       unit: 'days' },
  { domain: 'Fitness & Health', icon: '😴', name: 'Sleep 7+ hrs per night',     type: 'frequency',  period: 'weekly',   target: 5,    apps: ['health'],            proof: 'habit_logged',     metricId: 'sleep_hrs',      unit: 'nights' },
  { domain: 'Fitness & Health', icon: '⚖️', name: 'Lose 20 lbs',               type: 'milestone',  period: 'monthly',  target: 175,  apps: ['health', 'fitness'], proof: 'habit_logged',     metricId: 'weight_goal',    unit: 'lbs' },
  { domain: 'Fitness & Health', icon: '🚭', name: 'Quit smoking',               type: 'milestone',  period: 'yearly',   target: 365,  apps: ['health'],            proof: 'habit_logged',     metricId: 'smoke_free',     unit: 'days' },
  { domain: 'Fitness & Health', icon: '🧃', name: 'Dry January (or any month)', type: 'milestone',  period: 'monthly',  target: 30,   apps: ['health', 'diet'],    proof: 'habit_logged',     metricId: 'alcohol_free',   unit: 'days' },

  // ── Financial ─────────────────────────────────────────────────────────────
  { domain: 'Financial', icon: '🛡️', name: 'Build 6-month emergency fund',    type: 'milestone',  period: 'monthly',  target: 6,     apps: ['financial'],         proof: 'financial',        metricId: 'emergency_fund', unit: 'months',  suggestPlan: 'Emergency Fund Plan' },
  { domain: 'Financial', icon: '💳', name: 'Pay off credit card',              type: 'milestone',  period: 'monthly',  target: 3000,  apps: ['financial'],         proof: 'financial',        metricId: 'debt_free',      unit: '$' },
  { domain: 'Financial', icon: '🎓', name: 'Pay off student loans',            type: 'milestone',  period: 'yearly',   target: 20000, apps: ['financial'],         proof: 'financial',        metricId: 'debt_free',      unit: '$',       suggestPlan: 'Debt Payoff Plan' },
  { domain: 'Financial', icon: '✈️', name: 'Save for vacation',               type: 'milestone',  period: 'monthly',  target: 3000,  apps: ['financial'],         proof: 'financial',        metricId: 'purchase_fund',  unit: '$' },
  { domain: 'Financial', icon: '🏠', name: 'Save for a down payment',         type: 'milestone',  period: 'yearly',   target: 60000, apps: ['financial'],         proof: 'financial',        metricId: 'savings_amt',    unit: '$',       suggestPlan: 'Down Payment Plan' },
  { domain: 'Financial', icon: '📈', name: 'Invest $500/month',               type: 'frequency',  period: 'monthly',  target: 1,     apps: ['financial'],         proof: 'financial',        metricId: 'invest_contrib', unit: 'deposits' },
  { domain: 'Financial', icon: '💼', name: 'Launch a side income stream',     type: 'milestone',  period: 'monthly',  target: 500,   apps: ['financial'],         proof: 'financial',        metricId: 'side_income',    unit: '$/mo' },
  { domain: 'Financial', icon: '⭐', name: 'Reach 750 credit score',          type: 'milestone',  period: 'yearly',   target: 750,   apps: ['financial'],         proof: 'financial',        metricId: 'credit_score',   unit: 'pts' },
  { domain: 'Financial', icon: '🛒', name: 'Food budget under $800/month',    type: 'threshold',  period: 'monthly',  target: 800,   limit: 800, apps: ['financial'], proof: 'financial',      metricId: 'food_budget',    unit: '$/month' },
  { domain: 'Financial', icon: '💸', name: 'Cap total spend at $3k/month',    type: 'threshold',  period: 'monthly',  target: 3000,  limit: 3000, apps: ['financial'], proof: 'financial',    metricId: 'total_spend',    unit: '$/month' },

  // ── Learning & Career ─────────────────────────────────────────────────────
  { domain: 'Learning & Career', icon: '📚', name: 'Read 12 books this year',  type: 'milestone',  period: 'yearly',   target: 12,   apps: ['media'],             proof: 'habit_logged',     metricId: 'total_books',    unit: 'books',   suggestPlan: 'Read 12 Books' },
  { domain: 'Learning & Career', icon: '🏆', name: '52-book challenge',        type: 'milestone',  period: 'yearly',   target: 52,   apps: ['media'],             proof: 'habit_logged',     metricId: 'reading_challenge', unit: 'books' },
  { domain: 'Learning & Career', icon: '🗣️', name: 'Learn a language to B1',  type: 'milestone',  period: 'yearly',   target: 1,    apps: ['learning'],          proof: 'habit_logged',     metricId: 'language_level', unit: 'CEFR level', suggestPlan: 'Language Learning Plan' },
  { domain: 'Learning & Career', icon: '🗣️', name: 'Language practice daily', type: 'habit',      period: 'weekly',   target: 1,    apps: ['learning'],          proof: 'habit_logged',     metricId: 'language',       unit: 'days' },
  { domain: 'Learning & Career', icon: '🎓', name: 'Pass a certification',     type: 'milestone',  period: 'monthly',  target: 1,    apps: ['learning'],          proof: 'habit_logged',     metricId: 'certification',  unit: 'certs',   suggestPlan: 'Certification Prep Plan' },
  { domain: 'Learning & Career', icon: '🏋️', name: 'Complete a bootcamp',      type: 'milestone',  period: 'monthly',  target: 1,    apps: ['learning'],          proof: 'habit_logged',     metricId: 'bootcamp',       unit: 'programs' },
  { domain: 'Learning & Career', icon: '🚀', name: 'Ship a portfolio project', type: 'milestone',  period: 'monthly',  target: 1,    apps: ['learning'],          proof: 'habit_logged',     metricId: 'portfolio_project', unit: 'projects' },
  { domain: 'Learning & Career', icon: '🎓', name: 'Complete online course',   type: 'milestone',  period: 'monthly',  target: 1,    apps: ['learning'],          proof: 'habit_logged',     metricId: 'course',         unit: 'courses' },
  { domain: 'Learning & Career', icon: '📖', name: 'Read every day',           type: 'habit',      period: 'weekly',   target: 1,    apps: ['media'],             proof: 'habit_logged',     metricId: 'read_daily',     unit: 'days' },

  // ── Wellness & Nutrition ──────────────────────────────────────────────────
  { domain: 'Wellness & Nutrition', icon: '🥗', name: 'Log all meals daily',   type: 'habit',      period: 'weekly',   target: 1,    apps: ['diet'],              proof: 'habit_logged',     metricId: 'log_meals',      unit: 'days' },
  { domain: 'Wellness & Nutrition', icon: '🥩', name: 'Hit 150g protein daily', type: 'milestone', period: 'monthly',  target: 150,  apps: ['diet'],              proof: 'habit_logged',     metricId: 'protein_goal',   unit: 'g/day' },
  { domain: 'Wellness & Nutrition', icon: '🏆', name: 'Whole30 challenge',      type: 'milestone',  period: 'monthly',  target: 30,   apps: ['diet'],              proof: 'habit_logged',     metricId: 'diet_challenge', unit: 'days' },
  { domain: 'Wellness & Nutrition', icon: '💧', name: 'Drink 8 glasses daily',  type: 'frequency',  period: 'weekly',   target: 6,    apps: ['diet', 'health'],    proof: 'habit_logged',     metricId: 'water',          unit: 'days' },
  { domain: 'Wellness & Nutrition', icon: '🍳', name: 'Cook dinner at home 5×/wk', type: 'frequency', period: 'weekly', target: 5,  apps: ['diet'],              proof: 'habit_logged',     metricId: 'home_cooked',    unit: 'meals' },
  { domain: 'Wellness & Nutrition', icon: '📓', name: 'Journal every day',      type: 'habit',      period: 'weekly',   target: 1,    apps: ['journal'],           proof: 'habit_logged',     metricId: 'daily_entry',    unit: 'days' },

  // ── Home & Life ───────────────────────────────────────────────────────────
  { domain: 'Home & Life', icon: '🏠', name: 'Deep clean home monthly',        type: 'frequency',  period: 'monthly',  target: 1,    apps: [],                    proof: 'habit_logged',     metricId: null,             unit: 'times',   suggestPlan: 'Home Cleaning Plan' },
  { domain: 'Home & Life', icon: '🔧', name: 'Weekly home maintenance',        type: 'habit',      period: 'weekly',   target: 1,    apps: [],                    proof: 'habit_logged',     metricId: null,             unit: 'tasks' },
  { domain: 'Home & Life', icon: '📦', name: 'Declutter one room per month',   type: 'frequency',  period: 'monthly',  target: 1,    apps: [],                    proof: 'habit_logged',     metricId: null,             unit: 'rooms',   suggestPlan: 'Declutter Plan' },
  { domain: 'Home & Life', icon: '🤝', name: 'Volunteer 4 hrs/month',          type: 'frequency',  period: 'monthly',  target: 4,    apps: [],                    proof: 'habit_logged',     metricId: null,             unit: 'hours' },
  { domain: 'Home & Life', icon: '📞', name: 'Call family weekly',             type: 'habit',      period: 'weekly',   target: 1,    apps: [],                    proof: 'habit_logged',     metricId: null,             unit: 'calls' },
  { domain: 'Home & Life', icon: '🎟', name: 'Monthly date or friend outing',  type: 'frequency',  period: 'monthly',  target: 2,    apps: [],                    proof: 'habit_logged',     metricId: null,             unit: 'outings' },

  // ── Creativity ────────────────────────────────────────────────────────────
  { domain: 'Creativity', icon: '📖', name: 'Write a short story',             type: 'milestone',  period: 'monthly',  target: 1,    apps: ['journal'],           proof: 'habit_logged',     metricId: 'project',        unit: 'projects' },
  { domain: 'Creativity', icon: '✍️', name: 'Write 50,000 words (NaNoWriMo)', type: 'milestone',  period: 'monthly',  target: 50000, apps: ['journal'],           proof: 'habit_logged',     metricId: 'total_words',    unit: 'words' },
  { domain: 'Creativity', icon: '🎸', name: 'Learn guitar basics',             type: 'milestone',  period: 'monthly',  target: 4,    apps: ['learning'],          proof: 'habit_logged',     metricId: 'skill_level',    unit: '/10 level', suggestPlan: 'Guitar Learning Plan' },
  { domain: 'Creativity', icon: '🎨', name: 'Complete an art challenge',       type: 'milestone',  period: 'monthly',  target: 30,   apps: [],                    proof: 'habit_logged',     metricId: null,             unit: 'days',    suggestPlan: '30-Day Art Challenge' },
  { domain: 'Creativity', icon: '🎤', name: 'Give a public talk',              type: 'milestone',  period: 'yearly',   target: 1,    apps: ['learning'],          proof: 'habit_logged',     metricId: 'talk',           unit: 'talks' },
  { domain: 'Creativity', icon: '🎬', name: 'Watch 24 films this year',        type: 'milestone',  period: 'yearly',   target: 24,   apps: ['media'],             proof: 'habit_logged',     metricId: 'total_films',    unit: 'films' },
]

const DOMAINS = [
  'Fitness & Health',
  'Financial',
  'Learning & Career',
  'Wellness & Nutrition',
  'Home & Life',
  'Creativity',
]

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-3)', marginBottom: 5 }}>{label}</div>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

function SegBtn({ active, onClick, children }) {
  return (
    <button className={`btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}`} onClick={onClick} style={{ flex: 1 }}>
      {children}
    </button>
  )
}

// Compute a LENS-based hint for the target field based on recent activity
function computeLensHint(lensEvents, apps, type, metricId) {
  if (!lensEvents?.length || !apps?.length || !metricId) return null
  const now = new Date('2026-05-13')
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)

  if (apps.includes('fitness') && type === 'frequency' && metricId === 'workouts') {
    const recent = lensEvents.filter(e => e.source === 'fitness' && e.type === 'fitness.workout' && new Date(e.recordedAt) > fourWeeksAgo)
    if (recent.length >= 2) {
      const perWeek = (recent.length / 4).toFixed(1)
      const suggested = Math.min(7, Math.ceil(parseFloat(perWeek)) + 1)
      return `You average ~${perWeek} workouts/week — try targeting ${suggested}?`
    }
  }
  if (apps.includes('fitness') && type === 'frequency' && metricId === 'runs') {
    const recent = lensEvents.filter(e => e.source === 'fitness' && e.type === 'fitness.run' && new Date(e.recordedAt) > fourWeeksAgo)
    if (recent.length >= 2) {
      const perWeek = (recent.length / 4).toFixed(1)
      return `You averaged ~${perWeek} runs/week recently`
    }
  }
  if (apps.includes('media') && metricId === 'total_books') {
    const recent = lensEvents.filter(e => e.source === 'media' && e.type === 'media.completed' && e.payload?.mediaType === 'Book' && new Date(e.recordedAt) > fourWeeksAgo)
    if (recent.length > 0) {
      const annualPace = Math.round(recent.length * (52 / 4))
      return `At your current pace you're on track for ~${annualPace} books this year`
    }
  }
  if (apps.includes('financial') && metricId === 'food_budget') {
    const recent = lensEvents.filter(e => e.source === 'financial' && e.type === 'financial.transaction' && new Date(e.recordedAt) > fourWeeksAgo)
    if (recent.length > 0) return 'Track your food category transactions to get a spending baseline'
  }
  return null
}

// Check for conflicts with existing goals
function findConflict(existingGoals, form) {
  if (!existingGoals?.length || !form.apps?.length) return null
  for (const g of existingGoals) {
    if (!g.apps?.length) continue
    const overlap = form.apps.some(a => g.apps.includes(a))
    if (!overlap) continue
    if (g.type === form.type && g.metricId && g.metricId === form.metricId) {
      return `You already have a ${form.type} goal tracking "${form.metricId}" in ${g.apps.join('/')} ("${g.name}")`
    }
    if (g.type === form.type && g.type === 'frequency' && form.apps.some(a => g.apps.includes(a)) && !form.id) {
      return `You already have a ${form.type} goal for ${g.apps.filter(a => form.apps.includes(a)).join('/')} ("${g.name}") — consider combining them`
    }
  }
  return null
}

export default function GoalForm({ initial, onSave, onClose }) {
  const { data } = useStore()
  const isNew = !initial?.id
  const [step, setStep] = useState(isNew ? 0 : 1)
  const [domainFilter, setDomainFilter] = useState('All')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showAllMetrics, setShowAllMetrics] = useState(false)
  const [f, setF] = useState({
    name: '', type: 'frequency', period: 'weekly',
    target: 3, limit: 800, targetDate: '', proof: 'habit_logged', apps: [],
    metricId: null, unit: '',
    ...initial,
  })
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))

  function toggleApp(key) {
    setF(p => {
      const apps = (p.apps || []).includes(key) ? p.apps.filter(a => a !== key) : [...(p.apps || []), key]
      // If the current metric is no longer valid for the remaining apps, clear it
      const validMetrics = getAvailableMetrics(apps, p.type)
      const metricStillValid = validMetrics.some(m => m.id === p.metricId)
      return { ...p, apps, metricId: metricStillValid ? p.metricId : null }
    })
  }

  function getAvailableMetrics(apps, type) {
    const metrics = []
    const seen = new Set()
    for (const app of (apps || [])) {
      const appMetrics = APP_METRICS[app]?.[type] || []
      for (const m of appMetrics) {
        if (!seen.has(m.id)) { seen.add(m.id); metrics.push(m) }
      }
    }
    if (showAllMetrics) {
      for (const [appKey, types] of Object.entries(APP_METRICS)) {
        if ((apps || []).includes(appKey)) continue
        const appMetrics = types[type] || []
        for (const m of appMetrics) {
          if (!seen.has(m.id)) { seen.add(m.id); metrics.push({ ...m, fromApp: appKey }) }
        }
      }
    }
    return metrics
  }

  const availableMetrics = useMemo(
    () => getAvailableMetrics(f.apps, f.type),
    [f.apps, f.type, showAllMetrics]
  )

  // All threshold metrics from every app, grouped for the dropdown
  const allThresholdMetrics = useMemo(() => {
    const result = []
    for (const app of LIFE_APPS) {
      for (const m of (APP_METRICS[app.key]?.threshold || [])) {
        result.push({ ...m, app: app.key })
      }
    }
    return result
  }, [])

  const lensHint = useMemo(
    () => computeLensHint(data?.lensEvents, f.apps, f.type, f.metricId),
    [data?.lensEvents, f.apps, f.type, f.metricId]
  )

  const conflictWarning = useMemo(
    () => isNew ? findConflict(data?.goals, f) : null,
    [data?.goals, f.apps, f.type, f.metricId, f.name]
  )

  const selectedMetric = f.type === 'threshold'
    ? allThresholdMetrics.find(m => m.id === f.metricId)
    : availableMetrics.find(m => m.id === f.metricId)

  function applyTemplate(tmpl) {
    setF({
      name: tmpl.name,
      type: tmpl.type ?? 'frequency',
      period: tmpl.period ?? 'weekly',
      target: tmpl.target ?? 3,
      limit: tmpl.limit ?? 800,
      targetDate: tmpl.targetDate ?? '',
      proof: tmpl.proof ?? 'habit_logged',
      apps: tmpl.apps ?? [],
      metricId: tmpl.metricId ?? null,
      unit: tmpl.unit ?? '',
      _suggestPlan: tmpl.suggestPlan ?? null,
    })
    setStep(1)
  }

  // ── Step 0: Template picker ───────────────────────────────────────────────
  if (step === 0) {
    const filtered = domainFilter === 'All' ? GOAL_TEMPLATES : GOAL_TEMPLATES.filter(t => t.domain === domainFilter)
    return (
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Choose a template</div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 14 }}>Pick a starting point — you'll be able to edit all details.</div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {['All', ...DOMAINS].map(d => (
            <button key={d} className={`btn btn-sm ${domainFilter === d ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setDomainFilter(d)} style={{ fontSize: 11 }}>
              {d}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 340, overflowY: 'auto', marginBottom: 14 }}>
          {filtered.map(t => (
            <div key={t.name} onClick={() => applyTemplate(t)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--surface)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                  {t.domain} · {t.type}
                  {t.suggestPlan && <span style={{ marginLeft: 6, color: 'var(--accent)' }}>📋 Plan template available</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>Start from scratch →</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    )
  }

  // ── Step 1: Goal form ─────────────────────────────────────────────────────
  return (
    <div>
      {isNew && (
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 12, fontSize: 12 }} onClick={() => setStep(0)}>
          ← Choose template
        </button>
      )}

      <Field label="Goal name">
        <input className="input" placeholder="e.g. Gym 3x per week, Run a 5K, Read 12 books"
          value={f.name} onChange={e => set('name', e.target.value)} autoFocus />
      </Field>

      <Field label="Connected Life Suite apps">
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Activities in these apps will automatically count toward this goal.</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {LIFE_APPS.map(a => (
            <button key={a.key} className={`btn btn-sm ${(f.apps || []).includes(a.key) ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => toggleApp(a.key)}>
              {a.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Goal type">
        <div style={{ display: 'flex', gap: 4 }}>
          <SegBtn active={f.type === 'frequency'} onClick={() => { set('type', 'frequency'); set('metricId', null) }}>Frequency</SegBtn>
          <SegBtn active={f.type === 'milestone'} onClick={() => { set('type', 'milestone'); set('metricId', null) }}>Milestone</SegBtn>
          <SegBtn active={f.type === 'threshold'} onClick={() => { set('type', 'threshold'); set('metricId', null) }}>Threshold</SegBtn>
          <SegBtn active={f.type === 'habit'}     onClick={() => { set('type', 'habit');     set('metricId', null) }}>Habit</SegBtn>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>
          {f.type === 'frequency' && 'Do something N times per period (e.g. gym 3x/week)'}
          {f.type === 'milestone' && 'Reach a target by a date (e.g. run 5K, read 12 books)'}
          {f.type === 'threshold' && 'Stay under a limit — spending, time, behavior, or any measurable cap'}
          {f.type === 'habit'     && 'Daily practice — just show up every day'}
        </div>
      </Field>

      {/* Threshold limit picker — always visible when threshold is selected */}
      {f.type === 'threshold' && (
        <Field label="What to limit">
          <select className="input" value={f.metricId || ''} style={{ cursor: 'pointer' }}
            onChange={e => {
              const m = allThresholdMetrics.find(x => x.id === e.target.value)
              if (m) { set('metricId', m.id); set('unit', m.unit) }
              else   { set('metricId', null);  set('unit', '') }
            }}>
            <option value="">Choose a limit type…</option>
            {LIFE_APPS.map(app => {
              const opts = APP_METRICS[app.key]?.threshold || []
              if (!opts.length) return null
              return (
                <optgroup key={app.key} label={app.label}>
                  {opts.map(m => (
                    <option key={m.id} value={m.id}>{m.icon} {m.label} ({m.unit})</option>
                  ))}
                </optgroup>
              )
            })}
          </select>
          {selectedMetric && (
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>{selectedMetric.desc}</div>
          )}
        </Field>
      )}

      {/* Metric picker — shown when apps are selected (frequency / milestone / habit) */}
      {availableMetrics.length > 0 && f.type !== 'threshold' && (
        <Field label="What to measure">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
            {availableMetrics.filter(m => !m.fromApp).map(m => (
              <label key={m.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer',
                  padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                  background: f.metricId === m.id ? 'var(--accent-bg)' : 'var(--surface-2)',
                  border: `1px solid ${f.metricId === m.id ? 'rgba(167,139,250,.35)' : 'transparent'}`,
                }}
                onClick={() => { set('metricId', m.id); set('unit', m.unit) }}
              >
                <input type="radio" checked={f.metricId === m.id} onChange={() => {}} style={{ accentColor: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{m.icon} {m.label} <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 11 }}>({m.unit})</span></div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Import from other apps */}
          {!showAllMetrics && availableMetrics.filter(m => m.fromApp).length === 0 && (
            <button onClick={() => setShowAllMetrics(true)}
              style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              ＋ Import options from other apps
            </button>
          )}
          {showAllMetrics && availableMetrics.filter(m => m.fromApp).length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-3)', margin: '8px 0 4px' }}>From other apps</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
                {availableMetrics.filter(m => m.fromApp).map(m => (
                  <label key={m.id}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer',
                      padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                      background: f.metricId === m.id ? 'var(--accent-bg)' : 'var(--surface-2)',
                      border: `1px solid ${f.metricId === m.id ? 'rgba(167,139,250,.35)' : 'transparent'}`,
                      opacity: 0.8,
                    }}
                    onClick={() => { set('metricId', m.id); set('unit', m.unit) }}
                  >
                    <input type="radio" checked={f.metricId === m.id} onChange={() => {}} style={{ accentColor: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{m.icon} {m.label} <span style={{ fontWeight: 400, color: 'var(--text-3)', fontSize: 11 }}>({m.unit}) · from {LIFE_APPS.find(a => a.key === m.fromApp)?.label || m.fromApp}</span></div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <button onClick={() => setShowAllMetrics(false)}
                style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                ✕ Hide extra options
              </button>
            </>
          )}
        </Field>
      )}

      {['frequency', 'threshold'].includes(f.type) && (
        <Field label="Period">
          <div style={{ display: 'flex', gap: 4 }}>
            {['daily', 'weekly', 'monthly'].map(p => (
              <SegBtn key={p} active={f.period === p} onClick={() => set('period', p)}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </SegBtn>
            ))}
          </div>
        </Field>
      )}

      {f.type === 'frequency' && (
        <Field
          label={selectedMetric ? `Target ${selectedMetric.label.toLowerCase()} per ${f.period}` : `Target (times per ${f.period})`}
          hint={lensHint ? `💡 ${lensHint}` : null}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="number" className="input" min={1} max={99} style={{ maxWidth: 100 }}
              value={f.target} onChange={e => set('target', parseInt(e.target.value) || 1)} />
            {(f.unit || selectedMetric?.unit) && (
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{f.unit || selectedMetric?.unit}</span>
            )}
          </div>
        </Field>
      )}

      {f.type === 'milestone' && (
        <Field
          label={selectedMetric ? `Target ${selectedMetric.unit}` : "Target count"}
          hint={lensHint ? `💡 ${lensHint}` : null}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="number" className="input" min={1} style={{ maxWidth: 140 }}
              value={f.target} onChange={e => set('target', parseFloat(e.target.value) || 1)} />
            {(f.unit || selectedMetric?.unit) && (
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{f.unit || selectedMetric?.unit}</span>
            )}
          </div>
        </Field>
      )}

      {f.type === 'threshold' && (
        <Field
          label={selectedMetric ? `${selectedMetric.label} limit per ${f.period}` : `Spending limit per ${f.period}`}
          hint={lensHint ? `💡 ${lensHint}` : null}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="number" className="input" min={1} style={{ maxWidth: 140 }}
              value={f.limit} onChange={e => set('limit', parseFloat(e.target.value) || 0)} />
            {(f.unit || selectedMetric?.unit) && (
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{f.unit || selectedMetric?.unit}</span>
            )}
          </div>
        </Field>
      )}

      {['milestone', 'habit'].includes(f.type) && (
        <Field label="Target date (optional)">
          <input type="date" className="input"
            value={f.targetDate} onChange={e => set('targetDate', e.target.value)} />
        </Field>
      )}

      {/* Advanced toggle */}
      <div style={{ marginBottom: 14 }}>
        <button onClick={() => setShowAdvanced(v => !v)}
          style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {showAdvanced ? '▾' : '▸'} Advanced options
        </button>
        {showAdvanced && (
          <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <Field label="How to track">
              <select className="input" value={f.proof} onChange={e => set('proof', e.target.value)}
                style={{ cursor: 'pointer' }}>
                {PROOF_OPTIONS.map(p => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
              {PROOF_OPTIONS.find(p => p.key === f.proof) && (
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>
                  {PROOF_OPTIONS.find(p => p.key === f.proof).desc}
                </div>
              )}
            </Field>

            {f.type === 'frequency' && (
              <Field label="Rest days per week (optional)">
                <input type="number" className="input" min={0} max={6} style={{ maxWidth: 100 }}
                  placeholder="e.g. 2"
                  value={f.restDays ?? ''} onChange={e => set('restDays', e.target.value ? parseInt(e.target.value) : null)} />
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Progress won't warn on designated rest days</div>
              </Field>
            )}

            {['frequency', 'milestone'].includes(f.type) && (
              <Field label="Minimum session duration (optional)">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="number" className="input" min={1} style={{ maxWidth: 100 }}
                    placeholder="e.g. 30"
                    value={f.minDuration ?? ''} onChange={e => set('minDuration', e.target.value ? parseInt(e.target.value) : null)} />
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>min</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Sessions shorter than this won't count</div>
              </Field>
            )}
          </div>
        )}
      </div>

      {/* Conflict warning */}
      {conflictWarning && (
        <div style={{ padding: '10px 12px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 'var(--radius-sm)', marginBottom: 14, fontSize: 12, color: '#fbbf24' }}>
          ⚠️ {conflictWarning}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button className="btn btn-primary" style={{ flex: 1 }}
          onClick={() => f.name.trim() && onSave(f)} disabled={!f.name.trim()}>
          {initial?.id ? 'Update goal' : 'Create goal'}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}
