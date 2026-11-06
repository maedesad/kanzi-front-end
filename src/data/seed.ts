import type { Meaning, Word } from '../domain/vocabulary';

function meaning(id: string, pronunciation: string, translation: string,
  definition: string, examples: Meaning['examples']): Meaning {
  return { id, pronunciation, translation, definition, examples };
}

export const dictionary: Word[] = [
  { id: 'responsibility', text: 'Responsibility', meanings: [meaning('duty', '/rɪˌspɒnsəˈbɪləti/', 'مسئولیت',
    'A duty to take care of someone or something, and to be trusted to do it well.',
    ['Taking care of the garden is my responsibility.', 'She accepted responsibility for the decision.', 'We all have a responsibility to protect the environment.'])] },
  { id: 'curiosity', text: 'Curiosity', meanings: [meaning('interest', '/ˌkjʊəriˈɒsəti/', 'کنجکاوی',
    'A strong desire to know or learn something.',
    ['Her curiosity led her to explore the old library.', 'Children have a natural curiosity about the world.', 'I opened the letter out of curiosity.'])] },
  { id: 'serendipity', text: 'Serendipity', meanings: [meaning('chance', '/ˌserənˈdɪpəti/', 'اتفاق خوشایند',
    'The chance discovery of something valuable or pleasant when you are not looking for it.',
    ['Finding that little bookshop was pure serendipity.', 'Their friendship began through serendipity.', 'Science sometimes advances through serendipity.'])] },
  { id: 'resilience', text: 'Resilience', meanings: [meaning('recovery', '/rɪˈzɪliəns/', 'تاب‌آوری',
    'The ability to recover and adapt after difficulty or change.',
    ['She showed remarkable resilience after the setback.', 'Practice helps us build resilience.', 'The community faced the challenge with resilience.'])] },
  { id: 'wander', text: 'Wander', meanings: [meaning('walk', '/ˈwɒndə/', 'پرسه زدن',
    'To walk slowly without a fixed direction or purpose.',
    ['We like to wander through the city on Sundays.', 'Let us wander along the river.', 'My thoughts began to wander during the journey.'])] },
  { id: 'embrace', text: 'Embrace', meanings: [meaning('accept', '/ɪmˈbreɪs/', 'پذیرفتن',
    'To accept an idea, opportunity, or change willingly.',
    ['We should embrace new opportunities.', 'The team decided to embrace a different approach.', 'It takes courage to embrace change.'])] },
  { id: 'mindful', text: 'Mindful', meanings: [meaning('aware', '/ˈmaɪndfəl/', 'آگاه و توجه‌مند',
    'Paying careful attention to the present moment or to something important.',
    ['Be mindful of the people around you.', 'She is mindful of how she spends her time.', 'A mindful walk can help you feel calmer.'])] },
  { id: 'present', text: 'Present', meanings: [
    meaning('gift', '/ˈprez.ənt/', 'هدیه',
      'A gift, especially one that is given to someone for their birthday or at Christmas.',
      ['She gave her sister a beautiful present for her birthday.', 'The children were excited to open their presents under the tree.', 'The company gave a present to every employee who completed five years of service.']),
    meaning('here', '/ˈprez.ənt/', 'حاضر', 'Being in a particular place at a particular time.',
      ['Everyone was present at the meeting.', 'She was present when the decision was made.', 'Please be present for the first lesson.']),
    meaning('offer', '/prɪˈzent/', 'ارائه دادن', 'To give, show, or explain something to someone.',
      ['They will present their ideas tomorrow.', 'She was invited to present the award.', 'Please present your ticket at the entrance.']),
  ] },
  { id: 'gift', text: 'Gift', meanings: [meaning('gift', '/ɡɪft/', 'هدیه', 'Something given willingly to someone without payment.',
    ['This book is a gift from my friend.', 'They brought a gift for the host.', 'She chose a thoughtful gift.'])] },
  { id: 'presence', text: 'Presence', meanings: [meaning('being-there', '/ˈprezəns/', 'حضور', 'The fact of being in a particular place.',
    ['Your presence means a lot to us.', 'His calm presence reassured everyone.', 'The teacher noticed her presence.'])] },
  { id: 'thoughtful', text: 'Thoughtful', meanings: [meaning('considerate', '/ˈθɔːtfəl/', 'باملاحظه', 'Showing care and consideration for the needs of others.',
    ['That was a thoughtful gesture.', 'She wrote a thoughtful message.', 'He is a thoughtful friend.'])] },
  { id: 'opportunity', text: 'Opportunity', meanings: [meaning('chance', '/ˌɒpəˈtjuːnəti/', 'فرصت', 'A time or situation that makes it possible to do something.',
    ['This is an opportunity to learn.', 'She took the opportunity to travel.', 'Every day brings a new opportunity.'])] },
];

export const initialLibrary = dictionary.slice(0, 7);
