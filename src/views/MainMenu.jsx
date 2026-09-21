import { Flame, Puzzle, Globe, GraduationCap, Glasses, Search, Wrench } from 'lucide-react';
import Layout from '../components/ui/Layout';
import PageHeader from '../components/ui/PageHeader';
import IconBadge from '../components/ui/IconBadge';
import { colors, fonts } from '../config/theme';

export default function MainMenu({rating, blackoutRating, missingPieceRating, selectMode, thematic, editor}) {
  const ratingBadges = [
    { label: 'General Rating', value: rating },
    { label: 'Blackout Rating', value: blackoutRating },
    { label: 'Missing Piece Rating', value: missingPieceRating },
  ];

  const menuCards = [
    { mode: "streak", title: "Puzzle Streak", icon: Flame, desc: "Solve increasingly difficult puzzles until you fail. One strike and you're out." },
    { mode: "casual", title: "Casual Puzzles", icon: Puzzle, desc: "Solve puzzles at your own pace." },
    { mode: "daily", title: "Daily Challenge", icon: Globe, desc: "One fresh puzzle a day, the same for everyone." },
    { mode: "thematic", title: "Thematic Training", icon: GraduationCap, desc: "Focus on specific motifs like pins, forks, and back-rank mates." },
    { mode: "blackout", title: "Blackout", icon: Glasses, desc: "Memorize the position, then the pieces vanish. Solve it blind." },
    { mode: "missingPiece", title: "Missing Piece", icon: Search, desc: "One square is empty. Guess the piece, then play out the puzzle." },
    { mode: "editor", title: "Puzzle Editor", icon: Wrench, desc: "Set up any position, record the solution, and share a link to your own puzzle." },
  ];

  return (
    <Layout>
      <div style={{ maxWidth: '920px', margin: '0 auto' }}>
        <PageHeader title="Tactics Dashboard"/>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '-28px', marginBottom: '40px' }}>
          {ratingBadges.map((badge) => (
            <span key={badge.label} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: colors.surface,
              borderLeft: `4px solid ${colors.primary}`,
              borderRadius: '20px',
              padding: '8px 18px 8px 14px',
            }}>
              <span style={{ fontFamily: fonts.body, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.textSecondary }}>
                {badge.label}
              </span>
              <span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: '1.15rem', color: colors.textPrimary }}>
                {badge.value}
              </span>
            </span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '22px' }}>
          {menuCards.map((card) => (
            <div
              key={card.mode}
              onClick={() => card.mode === 'thematic' ? thematic() : card.mode === 'editor' ? editor() : selectMode(card.mode)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') (card.mode === 'thematic' ? thematic() : card.mode === 'editor' ? editor() : selectMode(card.mode)); }}
              style={{
                backgroundColor: colors.surface,
                borderLeft: `4px solid ${colors.primary}`,
                borderRadius: '6px',
                padding: '32px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, background-color 0.15s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.backgroundColor = colors.textInverted; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.backgroundColor = colors.surface; }}
            >
              <IconBadge icon={card.icon} />
              <h2 style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: '1.4rem', margin: '0 0 10px 0', color: colors.textPrimary }}>
                {card.title}
              </h2>
              <p style={{ color: colors.textSecondary, margin: 0, lineHeight: '1.5', fontSize: '0.95rem' }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}