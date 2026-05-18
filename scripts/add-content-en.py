import json

PATH = r'C:\Users\agenew\Desktop\DaoEssence1.0\zodiac\seo-content\2026-05-18.json'

CONTENT_EN = {
    "rat": """Today's energy is challenging for the Rat. With a score of 55/100, it's a day to play defense rather than offense. The cosmic alignment suggests obstacles in communication and unexpected delays, so patience will be your greatest asset.

Career-wise, avoid making bold moves or pitching major ideas. Stick to routine tasks and double-check all documents before submitting. A small oversight could create unnecessary complications. If colleagues seem distant or critical, don't take it personally — today's friction is temporary.

Financially, this is not a day for risky investments or impulse purchases. Keep your wallet closed and focus on budgeting. An unexpected expense might pop up, so having a buffer will save you stress.

In relationships, misunderstandings are more likely today. Choose your words carefully and give your partner or loved ones extra space if tensions rise. Single Rats should avoid making romantic declarations — wait for a better day.

Health requires attention to your nervous system and sleep quality. Avoid caffeine after noon and consider an early night. Gentle stretching or meditation can help release built-up tension.

Bottom line: lay low, stay organized, and don't force outcomes. Tomorrow brings fresh energy.""",

    "ox": """Today's energy is mixed for the Ox — a 60/100 score means opportunities and challenges arrive in equal measure. Your natural steadiness will help you navigate the ups and downs without losing your grounding.

At work, you'll find that methodical effort gets recognized, possibly by a supervisor or client. However, a competitive colleague might try to undermine your progress. Stay focused on your own tasks rather than engaging in office politics.

Money flows steadily but don't expect windfalls. It's a good day for reviewing your budget or planning long-term savings. Avoid lending money or co-signing anything — even to friends.

In love, partnered Oxen should plan a quiet evening together rather than a busy social outing. Quality conversation beats crowded events today. Single Oxen might meet someone interesting through work connections, but take time to evaluate before investing emotionally.

Health is stable but watch your digestive system. Stick to warm, simple foods and avoid heavy or greasy meals. A short walk after lunch will boost your afternoon productivity.

The key today: balance patience with prudent action. Not every opportunity needs to be seized immediately.""",

    "tiger": """Today's energy is genuinely favorable for the Tiger. After a period of steady groundwork, you're finally seeing tangible results from your persistence. The alignment between your natural ambition and today's cosmic rhythm creates a rare window where bold moves actually pay off.

Career-wise, this is one of those days where your ideas get heard. Whether you're pitching a new project, asking for a raise, or simply proposing a better workflow — people are receptive. Your natural leadership is amplified today, but here's the thing: don't try to handle everything yourself. Delegate what you can and focus on the high-impact decisions that only you can make.

Financially, steady income looks solid, and there's a decent chance of an unexpected bonus or reimbursement coming your way. If you've been considering a calculated investment or side hustle, today's energy supports careful risks. Just don't let the optimism override your usual financial caution.

In relationships, your charm and confidence are unusually magnetic today. A casual conversation could spark genuine interest if you stay open and authentic. For those in committed relationships, tonight favors quality time together. Plan something meaningful, whether it's a special dinner or an honest talk about shared future goals.

Health is on your side today. You have the physical and mental stamina to tackle demanding tasks. Channel that energy into something productive rather than letting it turn into restlessness. A morning workout or outdoor activity will set a positive tone for the entire day.

The advice for today: seize the momentum, but stay grounded. Not every good day guarantees tomorrow will be the same, so make the most of this window while it's open.""",

    "rabbit": """Today's energy is comfortably steady for the Rabbit, scoring 70/100. It's a day where things flow without much resistance — not spectacular, but reliably productive. Use this calm momentum to tackle tasks you've been procrastinating on.

Career progress comes through attention to detail today. Your diplomatic skills shine in team discussions, helping resolve minor conflicts before they escalate. If you've been considering a skill upgrade or certification, researching options now will yield useful insights.

Financially, it's a neutral day. No major gains or losses expected. Use this stability to organize your financial documents or set up automatic savings transfers. Small organizational wins compound over time.

Relationships benefit from your natural empathy today. Listen more than you speak, and you'll uncover what your partner or friend really needs. Single Rabbits should accept social invitations — a low-pressure gathering could lead to meaningful connection.

Health-wise, your energy is consistent but not abundant. Pace yourself and avoid over-scheduling. An evening of light reading or creative hobby work will restore your mental balance better than screen time.

Today rewards consistency over brilliance. Keep showing up.""",

    "dragon": """Today's energy is stable and manageable for the Dragon at 70/100. While you're not hitting peak momentum, the day offers a solid foundation for methodical progress. Your natural confidence is tempered by practicality today — use this balanced state to plan rather than execute.

At work, focus on completing pending tasks rather than launching new initiatives. Your attention to administrative details will prevent future headaches. A delayed project might finally receive the green light from higher-ups, so keep your documentation ready.

Money matters require a conservative approach. Review recurring subscriptions and trim unnecessary expenses. A small refund or reimbursement could arrive unexpectedly — check your accounts.

In relationships, your charisma is muted but genuine today. Deep conversations with your partner will strengthen your bond more than grand gestures. Single Dragons should avoid flashy first impressions; authenticity attracts better matches than showmanship.

Health is moderate. Your energy comes in waves — tackle demanding tasks in the morning when you're sharpest. An afternoon power nap or meditation session will restore focus for the evening.

The strategy today: prepare the ground for tomorrow's breakthroughs.""",

    "snake": """Today's 70/100 score brings a calm, introspective energy for the Snake. It's a day favoring reflection over action, strategy over execution. Your natural analytical abilities are heightened, making this an excellent time for research, planning, and behind-the-scenes preparation.

Professionally, avoid the spotlight. Your best contributions today come through thoughtful memos, detailed reports, or one-on-one mentoring. A subtle suggestion you make in a meeting could plant a seed that blooms next week.

Financially, information is your best asset. Read the fine print on any contracts or agreements. If an investment opportunity arises, your instinct to dig deeper will serve you well — there's likely more to the story than presented.

In love, emotional intimacy deepens through shared silence and understanding rather than words. Partnered Snakes will find comfort in familiar routines. Single Snakes might connect with someone who shares intellectual interests — a book club or workshop could be fruitful.

Health calls for inner balance. Practices like tai chi, yoga, or journaling will center you more than intense exercise. Pay attention to your skin and respiratory system — dry air or allergens might bother you today.

Embrace the quiet today. Not every day needs to be dramatic to be valuable.""",

    "horse": """Today's 55/100 score signals a challenging day for the Horse. Your natural drive and enthusiasm may meet unexpected resistance, creating frustration if you push too hard. The wisest approach is to slow down and reassess rather than force outcomes.

At work, delays and miscommunications are likely. Double-check all instructions and confirm appointments in writing. A project you thought was finalized might need revision — handle it calmly without assigning blame.

Financially, avoid any transactions involving speed or pressure. A "limited time offer" is probably not as good as it sounds. Postpone major purchases and avoid lending money, even in emergencies — the repayment timeline looks uncertain.

Relationships require extra patience today. Your direct communication style might come across as blunt. Pause before speaking and consider how your words land. Single Horses should avoid rushing into new connections — first impressions today are misleading.

Health-wise, watch your cardiovascular system and stress levels. Your restless energy needs constructive outlets — try swimming, cycling, or dancing rather than letting anxiety build. Avoid excessive caffeine and alcohol.

Bottom line: today is about damage control, not advancement. Protect what you have.""",

    "goat": """Today's outstanding 85/100 score brings one of the best energies of the month for the Goat. Creativity, charm, and good fortune align beautifully — it's a day to say yes to opportunities and trust your instincts.

Career breakthroughs are possible today. A creative solution you've been nurturing could finally get the recognition it deserves. Don't hesitate to present your ideas — your unique perspective is exactly what the situation needs. Collaboration flows smoothly, especially with artistic or intuitive colleagues.

Financially, luck is on your side. Unexpected income — perhaps from a past investment, a creative project, or even a small windfall — could brighten your day. However, avoid gambling or speculative risks; today's fortune favors earned rewards, not chance.

In love, your warmth and sensitivity are magnetic. Partnered Goats will enjoy a deeply romantic day — plan something beautiful and meaningful. Single Goats are at peak attractiveness; social events, especially those involving art or music, could lead to magical encounters.

Health is excellent. Your gentle nature finds joy in creative physical activities — dancing, gardening, or nature walks. Your immune system is strong, so it's a good day to start a new wellness routine.

Seize this golden day. The energy won't stay this favorable forever.""",

    "monkey": """Today's 80/100 score brings clever, quick-witted energy for the Monkey. Your natural adaptability is your superpower today — problems that stumped others will unravel under your creative approach. Stay alert for unexpected opportunities disguised as minor inconveniences.

At work, your problem-solving skills shine brightest. A technical glitch, communication breakdown, or logistical puzzle will benefit from your unconventional thinking. Share your ideas freely — colleagues are more receptive than usual to out-of-the-box suggestions.

Financially, your sharp instincts pay off. A bargain, discount, or clever financial maneuver could save or earn you money. Just avoid over-complicating simple transactions — your brilliance is best applied to genuinely complex problems.

In relationships, your humor and intelligence are irresistible today. Partnered Monkeys should plan a fun, lighthearted activity — laughter strengthens your bond. Single Monkeys shine at social gatherings where wit and conversation flow; don't hide your cleverness.

Health favors mental agility over brute strength. Brain games, puzzles, or learning something new will satisfy you more than repetitive exercise. However, do stretch regularly — your active mind might make you forget your body's needs.

Today rewards the agile mind. Stay curious, stay flexible.""",

    "rooster": """Today's 80/100 energy highlights your natural precision and organization, Rooster. It's a day where attention to detail separates winners from the pack — and you're built for exactly this kind of challenge. Your standards, usually seen as demanding, will be recognized as valuable today.

Career progress comes through excellence in execution. A presentation, report, or project you've polished meticulously will earn genuine praise. Don't downplay your contributions when acknowledged — accept compliments gracefully; you've earned them.

Financially, this is an excellent day for financial planning and organization. Review your portfolio, update your budget, or meet with a financial advisor. Your analytical eye will spot inefficiencies or opportunities others miss.

In love, your loyalty and reliability are your most attractive qualities today. Partnered Roosters should handle practical matters together — paying bills, planning a renovation, or organizing a trip. Shared responsibility deepens commitment. Single Roosters attract those who value stability and honesty.

Health benefits from structured routines. Your disciplined nature supports healthy habits — stick to your exercise schedule and meal plan today. Pay attention to your respiratory system; fresh air and deep breathing exercises will boost your vitality.

Precision is your path to progress today. Trust your standards.""",

    "dog": """Today's 80/100 score brings loyal, protective energy that amplifies your natural strengths, Dog. Your integrity and dedication are visible to everyone today — and they're opening doors you didn't even know existed. People trust you, and that trust is valuable currency.

At work, your reliability makes you the go-to person for important tasks. A responsibility others avoided might land on your desk — accept it confidently. Your thoroughness will produce results that impress decision-makers. A recommendation or endorsement from a respected colleague is possible.

Financially, conservative wisdom serves you best. Avoid flashy investments and stick to proven strategies. If someone asks for financial advice today, your honest assessment will be appreciated — but remember, you're not responsible for their choices.

In relationships, your devotion is deeply felt. Partnered Dogs should express their loyalty through consistent small actions rather than grand declarations. Single Dogs attract partners who value authenticity over performance — be yourself completely.

Health is strong, especially when you engage in activities that serve others. Volunteer work, helping a neighbor, or caring for a pet will boost your mood and energy simultaneously. Your heart health benefits from meaningful connection.

Your loyalty is your luck today. Stay true.""",

    "pig": """Today's 70/100 energy brings a comfortable, steady rhythm for the Pig. It's not a day of dramatic breakthroughs, but rather one of quiet contentment and gradual progress. Your natural generosity is well-received today — just ensure you're not giving more than you can afford, emotionally or financially.

At work, your collaborative spirit creates harmony in team settings. A conflict between colleagues might need your diplomatic touch — mediate gently without taking sides. Your ability to see the best in people will help heal a workplace rift.

Financially, stability is the theme. No windfalls, but no disasters either. It's an excellent day for charitable giving or supporting a cause you care about — the positive energy returns to you multiplied. Just set a clear budget for generosity.

In love, your warmth and acceptance create a safe harbor for your partner. Partnered Pigs should plan a cozy evening at home — good food, soft lighting, and genuine conversation. Single Pigs might find connection in unexpected places — perhaps through a mutual friend or a shared hobby.

Health favors comfort and nourishment. Indulge in wholesome, satisfying meals without guilt. A warm bath or sauna session will relax your muscles and calm your mind. Avoid overeating though — moderation keeps the comfort from becoming discomfort.

Today rewards kindness — starting with yourself."""
}


def main():
    with open(PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for sign, text in CONTENT_EN.items():
        if sign in data.get('fortunes', {}):
            data['fortunes'][sign]['contentEN'] = text.strip()
            print(f"Added contentEN for {sign} ({len(text)} chars)")

    with open(PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Total signs updated: {len(CONTENT_EN)}")


if __name__ == '__main__':
    main()
