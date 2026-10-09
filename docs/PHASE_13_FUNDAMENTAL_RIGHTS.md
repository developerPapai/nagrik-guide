# Phase 13 — Know Your Fundamental Rights (Article by Article)

**Goal:** Let a protestor look up any Article of the Constitution, understand in plain words what right it gives, learn the number by heart, and say it calmly to a police officer when needed.

**Use this file together with** `NAGRIK_GUIDE_BUILD_PLAN.md` and `NAGRIK_GUIDE_STEP_BY_STEP.md`.
**When to do it:** After Phase 10 (or any time later). **Time:** about 1.5 to 2 hours.
**Status of all text below:** `ai_draft`. Every Article description, case name, and Hindi line must be checked by a lawyer before public release. This phase adds new items to the "pending legal review" list.

How to start: save this file in your project as `docs/PHASE_13.md`, then go to **Section 4** and paste the prompts one by one.

---

## 1. What this phase adds

| New thing | What it is |
|---|---|
| **Article cards** (`/rights`) | One card for each Article, with the number in big letters, a plain-words meaning (English + Hindi), who is covered, the limits, and how it helps at a protest. |
| **Article finder** (`/rights/finder`) | "Police say X. Which Article helps me?" |
| **The 8 key numbers** | The eight Article numbers every protestor should remember, with an easy memory trick. |
| **Citation scripts S15 to S20** | Short sentences to say to an officer, with the Article number in them. Works with "Show to officer". |
| **Practice mode** (`/rights/practice`) | Flash cards to learn the numbers before you go. Works offline. |
| **Tappable Article links** | In every module, an Article chip (like "Art. 22(1)") now opens its card. |
| **Module M14** | A short overview module so Article numbers also show up in search and the library. |
| **Wallet card block** | The 8 key numbers added to the printable wallet card. |

---

## 2. Content pack

### 2.1 Read this before you quote an Article (goes on the `/rights` screen)

1. **An Article is the big promise. A section is the exact procedure.** The Constitution has *Articles* (for example Article 22). Laws such as the BNSS and BNS have *sections* (for example BNSS section 47). Police often talk in sections. You can use both.
2. **Say it calmly and politely.** Use a question or a request, one Article at a time. Do not lecture, shout, or wave your phone at the officer.
3. **Quoting an Article does not give you the power to stop the police.** Your rights are protected afterwards by the Magistrate and the courts. Use words only. Never use force.
4. **Rights have limits.** Most freedoms can be limited by law for reasons the Constitution lists (for example public order).
5. **Not every right is for everyone.** Article 19 rights are for **citizens**. Articles 14, 20, 21 and 22 are for **every person**, including non-citizens.
6. **There is no Article titled "right to protest".** Courts read it from Article 19(1)(a) (speech), 19(1)(b) (peaceful assembly) and 19(1)(c) (forming associations).

### 2.2 The 8 key numbers (memory trick)

| Number | Remember it as | One line |
|---|---|---|
| **14** | **Same** | The law must treat everyone equally. |
| **19** | **Speak, Gather, Unite, Move** | Free speech, peaceful assembly, forming groups, moving freely (citizens). |
| **20(3)** | **Silent** | You cannot be forced to speak against yourself. |
| **21** | **Safe** | Life, liberty and dignity can be taken only by fair legal procedure. |
| **22(1)** | **Told + Lawyer** | You must be told why you are arrested; you can consult a lawyer of your choice. |
| **22(2)** | **24 hours** | You must be taken to a Magistrate within 24 hours (travel time not counted). |
| **32** | **Supreme Court** | You can go straight to the Supreme Court if a fundamental right is violated. |
| **226** | **High Court** | You can go to the High Court (for example for illegal detention — habeas corpus). |

### 2.3 Article finder — "Which Article for which problem?" (seed for `articleFinder.json`)

| What is happening | Article(s) | In plain words | Also open |
|---|---|---|---|
| Told to stop chanting, speaking, or holding a placard | 19(1)(a); limits in 19(2) | You may express yourself, but not in ways the law can restrict (for example incitement to violence, defamation). | M07 |
| Told the gathering is not allowed / "disperse" | 19(1)(b); limits in 19(3) | Peaceful, unarmed assembly is protected, but the State can restrict for public order. Ask to see any order in writing. | M07 |
| Told you cannot form a group, union or organisation | 19(1)(c); limits in 19(4) | You may form associations and unions, subject to reasonable limits. | M07 |
| Stopped from going to or through an area | 19(1)(d); limits in 19(5) | Free movement, but limits are allowed in the public interest. | M07 |
| Told to answer questions, "confess", or sign | 20(3) | You cannot be forced to give evidence against yourself. | M04, S07, S08 |
| Taken away without being told why | 22(1) | You must be told the grounds as soon as possible. | M04, S02 |
| Not allowed to call or see a lawyer | 22(1); 39A (free legal aid) | You can consult a lawyer of your choice; free legal aid exists. | M06, S04 |
| Kept for more than a day | 22(2) | Magistrate within 24 hours (travel time not counted). | M05 |
| Being beaten, humiliated, or ill-treated | 21 | Torture and cruel treatment are not allowed. Tell the doctor and Magistrate. | M11, S10, S12 |
| Phone demanded or seized | 21 (privacy); 20(3) | Privacy is protected. Whether you can be forced to unlock it is unsettled. | M09, S09 |
| Treated differently because of religion, caste, sex, or place of birth | 14, 15 | The State must not discriminate. | M14 |
| Family cannot find you / you are held illegally | 226 and 32 | Your lawyer or family can file a habeas corpus petition. | M05 |
| Held under a preventive detention law | 22(3)–(7) | Different rules apply. Get a lawyer at once. | M12 |

### 2.4 Article cards (seed for `src/content/fundamental-rights.json`)

> **Columns:** `id` | Article | Name (EN) | Name (HI) | In plain words | Who is covered | Limits and gray areas | Priority (1 = key, 2 = useful, 3 = background)
> **All rows:** `status: ai_draft`, `draftedOn: 2026-10-09`, `lastVerified: null`, `verify: true`.
> Hindi plain-words lines are given for priority-1 rows only. The AI writes simple-Hindi drafts for the rest and marks them `translation: ai_draft`.

#### Group: Equality (Arts. 14–18)

| id | Article | Name (EN) | Name (HI) | In plain words | Who | Limits / gray areas | P |
|---|---|---|---|---|---|---|---|
| `art-14` | 14 | Equality before law | विधि के समक्ष समता | The law must treat everyone equally. The State cannot act in an arbitrary or unfair way. **HI:** कानून की नज़र में सब बराबर हैं, और कानून की सुरक्षा सबको बराबर मिलनी चाहिए। | Every person | The State may treat different groups differently only for a reasonable purpose. | 1 |
| `art-15` | 15 | No discrimination | भेदभाव का निषेध | The State cannot discriminate only because of religion, race, caste, sex, or place of birth. | Citizens (for 15(1)) | Special provisions for women, children, and disadvantaged groups are allowed. | 2 |
| `art-16` | 16 | Equal opportunity in public jobs | लोक नियोजन में अवसर की समता | Everyone has equal opportunity in government jobs. | Citizens | Reservations and other provisions are allowed by the Constitution. | 3 |
| `art-17` | 17 | End of untouchability | अस्पृश्यता का अंत | Untouchability is abolished and its practice is forbidden. | Everyone | Practising it is a punishable offence under law. | 3 |
| `art-18` | 18 | End of titles | उपाधियों का अंत | The State cannot give titles (except military and academic distinctions). | Citizens | — | 3 |

#### Group: Freedom (Arts. 19–22)

| id | Article | Name (EN) | Name (HI) | In plain words | Who | Limits / gray areas | P |
|---|---|---|---|---|---|---|---|
| `art-19-1-a` | 19(1)(a) | Freedom of speech and expression | वाक्-स्वातंत्र्य और अभिव्यक्ति | You can say, write, and express your views (speech, slogans, posters, art, and online expression). **HI:** आप अपनी बात बोलने, लिखने और व्यक्त करने के लिए स्वतंत्र हैं (नारे, भाषण, पोस्टर, सोशल मीडिया)। | Citizens | Limits in Art. 19(2): sovereignty and integrity of India, security of the State, friendly relations with foreign States, public order, decency or morality, contempt of court, defamation, incitement to an offence. Courts protect discussion and advocacy; incitement can be restricted. | 1 |
| `art-19-1-b` | 19(1)(b) | Freedom to assemble peacefully | शांतिपूर्वक और निरायुध सम्मेलन | You can gather with others **peacefully and without arms**. **HI:** आप शांतिपूर्वक और बिना हथियार के इकट्ठा हो सकते हैं। | Citizens | Limits in Art. 19(3): sovereignty and integrity of India, or public order. Prohibitory orders (BNSS s.163) can restrict gatherings. Courts have said protests cannot block public roads indefinitely. There is no fundamental right to force a bandh or hartal on others (verify). | 1 |
| `art-19-1-c` | 19(1)(c) | Freedom to form associations and unions | संगम या संघ बनाने की स्वतंत्रता | You can form organisations, groups, unions, and cooperative societies. **HI:** आप संगठन, संघ या यूनियन बना सकते हैं। | Citizens | Limits in Art. 19(4): sovereignty and integrity of India, public order, or morality. | 1 |
| `art-19-1-d` | 19(1)(d) | Freedom to move freely | देश में अबाध संचरण | You can move freely throughout India. **HI:** आप भारत में कहीं भी स्वतंत्र रूप से आ-जा सकते हैं। | Citizens | Limits in Art. 19(5): general public interest, or protection of Scheduled Tribes. This does not allow you to block other people's movement. | 1 |
| `art-19-1-e` | 19(1)(e) | Freedom to live and settle anywhere | निवास और बस जाने की स्वतंत्रता | You can live and settle in any part of India. | Citizens | Limits in Art. 19(5). | 3 |
| `art-19-1-g` | 19(1)(g) | Freedom of profession and trade | वृत्ति, उपजीविका, व्यापार की स्वतंत्रता | You can practise any profession or carry on any occupation, trade, or business. | Citizens | Limits in Art. 19(6). | 3 |
| `art-19-limits` | 19(2)–(5) | Limits on Article 19 freedoms | अनुच्छेद 19 की सीमाएँ | Freedoms can be limited, but only **(1) by a law, (2) for a reason the Constitution lists, and (3) if the limit is reasonable.** An officer cannot invent a restriction. Courts can review a restriction. | Citizens | Whether a particular restriction is "reasonable" is often decided by courts later. | 2 |
| `art-20-1-2` | 20(1)–(2) | No punishment under a later law; no double punishment | पूर्वव्यापी दंड और दोहरे दंड से संरक्षण | You cannot be punished for something that was not an offence when you did it, and you cannot be prosecuted and punished twice for the same offence. | Every person | — | 2 |
| `art-20-3` | 20(3) | Right against self-incrimination | आत्म-अभिशंसन से संरक्षण | An accused person cannot be forced to be a witness against himself or herself. You can stay silent about the case. **HI:** किसी आरोपी को अपने ही ख़िलाफ़ गवाही देने के लिए मजबूर नहीं किया जा सकता। आपको चुप रहने का अधिकार है। | Every person accused of an offence | Courts have applied this at the police-questioning stage. It protects against being forced to give *testimony*. It does not stop police from taking fingerprints, handwriting, or other samples as the law allows (verify). You must still give your name and address when asked (BNSS s.39). Phone passcode/biometric unlocking is unsettled. | 1 |
| `art-21` | 21 | Protection of life and personal liberty | प्राण और दैहिक स्वतंत्रता का संरक्षण | Your life and personal liberty can be taken away only by a **fair, legal procedure.** Courts have read into it dignity, protection from torture, privacy, a fair trial, and legal aid. **HI:** कानून द्वारा तय प्रक्रिया के बिना आपका जीवन और आपकी व्यक्तिगत स्वतंत्रता नहीं छीनी जा सकती। इसमें सम्मान से जीना, यातना से सुरक्षा और निजता शामिल मानी गई हैं। | Every person | The procedure must be fair, just, and reasonable (Maneka Gandhi). Lawful arrest and detention that follow the law are not a violation. | 1 |
| `art-21a` | 21A | Right to education | शिक्षा का अधिकार | Free and compulsory education for children aged 6 to 14. | Children | — | 3 |
| `art-22-1` | 22(1) | Right to be told the grounds of arrest and to consult a lawyer | गिरफ़्तारी के कारण जानने और वकील से सलाह का अधिकार | When arrested, you must be told the reason as soon as possible. You can consult and be defended by a lawyer of your choice. **HI:** गिरफ़्तारी पर आपको कारण बताए जाने चाहिए और आप अपनी पसंद के वकील से सलाह ले सकते हैं। | Every arrested person | Does not apply the same way to an "enemy alien" or to a person held under a preventive detention law (Art. 22(3)). The Supreme Court has said written grounds must be given in some settings (verify). | 1 |
| `art-22-2` | 22(2) | 24-hour rule | 24 घंटे में मजिस्ट्रेट के सामने पेशी | If you are arrested and kept in custody, you must be produced before the nearest Magistrate **within 24 hours**, not counting travel time. Without the Magistrate's order you cannot be held longer. **HI:** गिरफ़्तारी के 24 घंटे के भीतर (यात्रा का समय छोड़कर) आपको नज़दीकी मजिस्ट्रेट के सामने पेश किया जाना चाहिए। | Every arrested person | Does not apply the same way under a preventive detention law (Art. 22(3)). | 1 |
| `art-22-3to7` | 22(3)–(7) | Preventive detention | निवारक निरोध | Different rules apply if you are held under a preventive detention law. You must be told the grounds as soon as possible and can make a representation. Detention beyond three months generally needs an Advisory Board's approval (verify). | Every person held under such a law | The 24-hour and lawyer-of-choice rules of Art. 22(1) and 22(2) do not apply in the same way. Get a lawyer at once. | 2 |

#### Group: Exploitation (Arts. 23–24)

| id | Article | Name (EN) | Name (HI) | In plain words | Who | Limits | P |
|---|---|---|---|---|---|---|---|
| `art-23` | 23 | No trafficking or forced labour | मानव दुर्व्यापार और बलात् श्रम का प्रतिषेध | Trafficking in human beings and forced labour (begar) are forbidden. | Every person | — | 3 |
| `art-24` | 24 | No child labour in dangerous work | बालकों के नियोजन का प्रतिषेध | Children under 14 cannot be employed in factories, mines, or other hazardous work. | Children | — | 3 |

#### Group: Freedom of religion (Arts. 25–28)

| id | Article | Name (EN) | Name (HI) | In plain words | Who | Limits | P |
|---|---|---|---|---|---|---|---|
| `art-25` | 25 | Freedom of conscience and religion | अंतःकरण और धर्म की स्वतंत्रता | Everyone can freely follow, practise, and spread their religion. | Every person | Subject to public order, morality, health, and other fundamental rights. | 2 |
| `art-26` | 26 | Managing religious affairs | धार्मिक कार्यों के प्रबंध की स्वतंत्रता | Religious groups can manage their own religious affairs. | Religious denominations | Subject to public order, morality, and health. | 3 |
| `art-27` | 27 | No tax for promoting a religion | धर्म की अभिवृद्धि के लिए कर से स्वतंत्रता | No one can be forced to pay taxes that promote a particular religion. | Every person | — | 3 |
| `art-28` | 28 | Religious instruction in schools | शिक्षा संस्थाओं में धार्मिक शिक्षा के बारे में स्वतंत्रता | No one can be forced to take part in religious instruction or worship in certain educational institutions. | Every person | Rules differ for State-funded, State-recognised, and trust-run institutions. | 3 |

#### Group: Cultural and educational rights (Arts. 29–30)

| id | Article | Name (EN) | Name (HI) | In plain words | Who | Limits | P |
|---|---|---|---|---|---|---|---|
| `art-29` | 29 | Protection of minority culture | अल्पसंख्यक-वर्गों के हितों का संरक्षण | Any group of citizens with a distinct language, script, or culture has the right to conserve it. | Citizens | — | 3 |
| `art-30` | 30 | Minority educational institutions | अल्पसंख्यक-वर्गों का शिक्षा संस्थाएँ स्थापित करने का अधिकार | Minorities (religious or linguistic) can set up and run educational institutions of their choice. | Minorities | — | 3 |

#### Group: Remedies and related Articles

| id | Article | Name (EN) | Name (HI) | In plain words | Who | Limits / gray areas | P |
|---|---|---|---|---|---|---|---|
| `art-32` | 32 | Right to constitutional remedies (Supreme Court) | संवैधानिक उपचारों का अधिकार | You can go directly to the Supreme Court if a fundamental right is violated. It can issue writs such as habeas corpus. **HI:** यदि आपके मौलिक अधिकारों का उल्लंघन हो, तो आप सीधे सर्वोच्च न्यायालय जा सकते हैं। | Every person | The Supreme Court may ask you to go to the High Court first in some cases. | 1 |
| `art-226` | 226 | High Courts' power to issue writs | उच्च न्यायालयों की रिट जारी करने की शक्ति | You can go to the High Court for enforcement of fundamental rights and other legal rights. For illegal detention, a habeas corpus petition can be filed by you, your family, or your lawyer. **HI:** आप मौलिक अधिकारों के लिए उच्च न्यायालय भी जा सकते हैं। अवैध हिरासत के लिए बंदी प्रत्यक्षीकरण (habeas corpus) याचिका दायर की जा सकती है। | Every person | This is a High Court *power*, not a Part III fundamental right, but it is the most common route in practice. | 1 |
| `art-12-13` | 12, 13 | Who the rights are against; void laws | राज्य की परिभाषा; असंगत विधियाँ शून्य | "State" includes the Government, Parliament, State legislatures, and local and other authorities — **this includes the police**. A law that takes away or reduces a fundamental right is void to that extent. | Everyone | Fundamental rights are mainly claimed against the State. | 2 |
| `art-39a` | 39A | Free legal aid (Directive Principle) | निःशुल्क विधिक सहायता (राज्य के नीति निदेशक तत्व) | The State must ensure equal justice and free legal aid. | Everyone | This is a **Directive Principle**, not a fundamental right. Courts link legal aid to Art. 21, and the Legal Services Authorities Act gives free legal services to a person in custody (s.12(g)). | 2 |
| `art-51a-i` | 51A(i) | Fundamental duty: protect public property, avoid violence | मौलिक कर्तव्य: सार्वजनिक संपत्ति की रक्षा, हिंसा का त्याग | Every citizen has a duty to protect public property and give up violence. | Citizens | Duties are not directly enforced by courts like rights, but they describe what lawful protest looks like. | 2 |

### 2.5 Citation scripts (add to `scripts.json`)

> Show this safety line under each: *"Say it calmly and politely. Quoting an Article does not give you power to stop the police. Do not resist physically."*
> In Hindi the sub-clauses are (क) for (a), (ख) for (b), (ग) for (c), (घ) for (d). The app should show both "19(1)(a)" and "19(1)(क)" in search.

| ID | Situations | English | हिन्दी | Roman Hindi |
|---|---|---|---|---|
| **S15** | arrested, custody | "Officer, under Article 22(1) of the Constitution I have the right to be told the reason for my arrest and to consult a lawyer of my choice. May I know the reason, please?" | "अधिकारी महोदय, संविधान के अनुच्छेद 22(1) के अनुसार मुझे अपनी गिरफ़्तारी का कारण जानने और अपनी पसंद के वकील से सलाह लेने का अधिकार है। कृपया मुझे कारण बताइए।" | "Adhikari mahoday, samvidhaan ke anuchhed 22(1) ke anusaar mujhe apni giraftaari ka kaaran jaanne aur apni pasand ke vakeel se salaah lene ka adhikaar hai. Kripya mujhe kaaran bataiye." |
| **S16** | detained, custody | "Under Article 22(2), I must be produced before the nearest Magistrate within 24 hours of my arrest, not counting travel time. Please take me before a Magistrate." | "अनुच्छेद 22(2) के अनुसार गिरफ़्तारी के 24 घंटे के भीतर (यात्रा का समय छोड़कर) मुझे निकटतम मजिस्ट्रेट के सामने पेश किया जाना चाहिए। कृपया मुझे मजिस्ट्रेट के सामने ले चलिए।" | "Anuchhed 22(2) ke anusaar giraftaari ke 24 ghante ke bheetar (yaatra ka samay chhodkar) mujhe nikatatam magistrate ke saamne pesh kiya jaana chahiye. Kripya mujhe magistrate ke saamne le chaliye." |
| **S17** | stopped, arrested, custody | "Under Article 20(3), no accused person can be forced to be a witness against himself. I choose to remain silent until I speak to my lawyer." | "अनुच्छेद 20(3) के अनुसार किसी भी आरोपी को अपने विरुद्ध गवाह बनने के लिए बाध्य नहीं किया जा सकता। मैं अपने वकील से बात होने तक चुप रहना चाहता/चाहती हूँ।" | "Anuchhed 20(3) ke anusaar kisi bhi aaropi ko apne viruddh gavaah banne ke liye baadhya nahin kiya ja sakta. Main apne vakeel se baat hone tak chup rehna chahta/chahti hoon." |
| **S18** | detained, arrested, custody | "Article 21 protects my life and personal liberty. I am cooperating and not resisting. Please follow the procedure laid down by law and do not use force." | "अनुच्छेद 21 मेरे जीवन और व्यक्तिगत स्वतंत्रता की रक्षा करता है। मैं सहयोग कर रहा/रही हूँ और विरोध नहीं कर रहा/रही। कृपया कानून द्वारा तय प्रक्रिया का पालन कीजिए और बल प्रयोग न कीजिए।" | "Anuchhed 21 mere jeevan aur vyaktigat swatantrata ki raksha karta hai. Main sahyog kar raha/rahi hoon aur virodh nahin kar raha/rahi. Kripya kaanoon dwara tay prakriya ka paalan kijiye aur bal prayog na kijiye." |
| **S19** | stopped, detained | "I am protesting peacefully and without arms. Article 19(1)(a) and 19(1)(b) protect free speech and peaceful assembly. If there is an order restricting this gathering, please show it to me in writing." | "मैं शांतिपूर्ण और निहत्था प्रदर्शन कर रहा/रही हूँ। अनुच्छेद 19(1)(क) और 19(1)(ख) बोलने की स्वतंत्रता और शांतिपूर्ण सभा का अधिकार देते हैं। यदि इस सभा पर कोई प्रतिबंध-आदेश है, तो कृपया मुझे लिखित में दिखाइए।" | "Main shaantipoorn aur nihattha pradarshan kar raha/rahi hoon. Anuchhed 19(1)(ka) aur 19(1)(kha) bolne ki swatantrata aur shaantipoorn sabha ka adhikaar dete hain. Yadi is sabha par koi pratibandh-aadesh hai, to kripya mujhe likhit mein dikhaiye." |
| **S20** | arrested, custody | **(20-second version)** "I will cooperate peacefully. Under Article 22(1), please tell me the reason for my arrest. Under Article 20(3), I will stay silent. Under Article 22(2), I must be produced before a Magistrate within 24 hours. I want my lawyer." | "मैं शांतिपूर्वक सहयोग करूँगा/करूँगी। अनुच्छेद 22(1) के अनुसार कृपया मुझे गिरफ़्तारी का कारण बताइए। अनुच्छेद 20(3) के अनुसार मैं चुप रहूँगा/रहूँगी। अनुच्छेद 22(2) के अनुसार 24 घंटे के भीतर मुझे मजिस्ट्रेट के सामने पेश किया जाना चाहिए। मुझे अपना वकील चाहिए।" | "Main shaantipoorvak sahyog karoonga/karoongi. Anuchhed 22(1) ke anusaar kripya mujhe giraftaari ka kaaran bataiye. Anuchhed 20(3) ke anusaar main chup rahoonga/rahoongi. Anuchhed 22(2) ke anusaar 24 ghante ke bheetar mujhe magistrate ke saamne pesh kiya jaana chahiye. Mujhe apna vakeel chahiye." |

**Warnings (`warning` field):**
- S19 → "If a lawful order to disperse is given, leave. Article 19 freedoms have limits (19(2), 19(3))."
- S17 → "You must still give your name and address when asked."
- S20 → "Say this calmly. Do not repeat it in an angry or mocking way."

**Say it well — short tips (show on the script screen):**
| Do | Don't |
|---|---|
| Use a request: "May I know the reason, please?" | Don't threaten: "I will sue you." |
| One Article at a time | Don't read a long list of Articles at once |
| Say the plain meaning too: "Article 22(1), the right to know why I am arrested" | Don't claim more than the Article says (for example "Article 19 means you cannot stop me") |
| Note the officer's name, time, and what was said | Don't argue if the officer does not respond. Stay calm, keep notes, tell your lawyer. |

### 2.6 New law references (add to `lawrefs.json`; all `verify: true`)

| id | Topic | Current | Old |
|---|---|---|---|
| `const-12-13` | Meaning of "State"; laws against fundamental rights are void | Constitution Art. 12, 13 | — |
| `const-14` | Equality before law | Art. 14 | — |
| `const-15` | No discrimination | Art. 15 | — |
| `const-19-1-c` | Freedom to form associations/unions | Art. 19(1)(c) and 19(4) | — |
| `const-19-1-d` | Freedom of movement | Art. 19(1)(d) and 19(5) | — |
| `const-19-2to5` | Limits on Art. 19 freedoms | Art. 19(2)–(5) | — |
| `const-20-1-2` | No retroactive punishment; no double jeopardy | Art. 20(1), 20(2) | — |
| `const-21a` | Right to education | Art. 21A | — |
| `const-51a` | Fundamental duty: protect public property, abjure violence | Art. 51A(i) | — |

*Existing references stay as they are:* `const-19` (19(1)(a),(b)), `const-20-3`, `const-21`, `const-22`, `const-22-3to7`, `const-32-226`, `const-39a`, `const-358-359`.

### 2.7 New case cards (add to `cases.json`; all `verifyCitation: true`)

| id | Case | Year / citation (verify) | Holding → why it matters |
|---|---|---|---|
| `case-maneka` | Maneka Gandhi v. Union of India | 1978, (1978) 1 SCC 248 | The procedure in Art. 21 must be fair, just, and reasonable, and Arts. 14, 19 and 21 work together. |
| `case-shreya` | Shreya Singhal v. Union of India | 2015, (2015) 5 SCC 1 | Discussion and advocacy are protected under Art. 19(1)(a); only incitement can be restricted. |
| `case-hussainara` | Hussainara Khatoon v. State of Bihar | 1979, (1980) 1 SCC 81 | Speedy trial and free legal aid are part of Art. 21. |
| `case-kathikalu` | State of Bombay v. Kathi Kalu Oghad | 1961, AIR 1961 SC 1808 | Art. 20(3) covers compelled testimony, not giving fingerprints or handwriting samples. |
| `case-bharatkumar` | Communist Party of India (M) v. Bharat Kumar | 1998, (1998) 1 SCC 201 | No fundamental right to enforce a bandh that stops others' normal life. |

### 2.8 Module M14 — "Your Fundamental Rights: the numbers to remember" (group: reference)

- **Summary:** The Constitution's Part III lists your fundamental rights. These eight numbers matter most at a protest: **14, 19, 20(3), 21, 22(1), 22(2), 32, 226**.
- **Know:**
  - **Article = the big promise. Section = the exact procedure.** Articles are in the Constitution. Sections are in laws such as the BNSS and BNS. (`const-12-13`)
  - Fundamental rights are mainly claimed against the **State**, which includes the police. (`const-12-13`)
  - **19(1)(a), (b), (c), (d):** speak, gather peacefully and unarmed, form groups, move freely — for **citizens** only, with limits in 19(2)–(5). (`const-19`, `const-19-1-c`, `const-19-1-d`, `const-19-2to5`)
  - **20(3):** you cannot be forced to be a witness against yourself. (`const-20-3`, case-nandini, case-selvi)
  - **21:** life and liberty only by fair legal procedure; includes dignity, protection from torture, privacy. (`const-21`, case-maneka, case-dkbasu, case-puttaswamy)
  - **22(1) and 22(2):** told the grounds; a lawyer of your choice; Magistrate within 24 hours. (`const-22`)
  - **32 and 226:** the Supreme Court and the High Court can protect these rights. A habeas corpus petition is the usual remedy for illegal detention. (`const-32-226`)
  - **39A** (free legal aid) is a Directive Principle, but free legal aid for people in custody is available by law. (`const-39a`, `lsa-12g`)
- **Do:** Learn the 8 numbers using Practice mode. Use S15–S20 calmly. Write down what the officer says and the time.
- **Don't:** Don't lecture. Don't over-claim. Don't use force. Don't assume quoting an Article will end the situation.
- **Say:** S15, S16, S17, S18, S19, S20.
- **Gray areas:**
  - There is no Article titled "right to protest"; it is read from 19(1)(a), (b) and (c). (`const-19`)
  - Article 19 rights belong to citizens; Articles 14, 20, 21, 22 belong to every person. (`const-14`, `const-20-3`, `const-21`, `const-22`)
  - Rights have limits and courts often judge a restriction only after the event.
- **Tags:** article, anuchhed, अनुच्छेद, fundamental rights, maulik adhikar, मौलिक अधिकार, constitution, samvidhan, 14, 19, 20, 21, 22, 32, 226

### 2.9 Wallet card addition
Add a block "The 8 key numbers": 14 Same · 19 Speak, Gather, Unite, Move · 20(3) Silent · 21 Safe · 22(1) Told + Lawyer · 22(2) 24 hours · 32 Supreme Court · 226 High Court. Add scripts S20 (20-second version) in English and Hindi.

### 2.10 New UI text (add to `en.json` / `hi.json`)

| key | EN | हिन्दी |
|---|---|---|
| `home.articles` | Know your Articles | अपने अनुच्छेद जानें |
| `rights.title` | Fundamental Rights — Articles | मौलिक अधिकार — अनुच्छेद |
| `rights.search` | Type an Article number, for example 22 | अनुच्छेद संख्या लिखें, जैसे 22 |
| `rights.key8` | The 8 key numbers | 8 ज़रूरी संख्याएँ |
| `rights.finder` | Which Article for my problem? | मेरी समस्या के लिए कौन-सा अनुच्छेद? |
| `rights.practice` | Practice | अभ्यास |
| `rights.who` | Who is covered | किन्हें अधिकार मिलता है |
| `rights.limits` | Limits | सीमाएँ |
| `rights.protest` | How it helps at a protest | प्रदर्शन में यह कैसे मदद करता है |
| `rights.say` | Say it | इसे कहें |
| `who.citizens` | Citizens only | केवल नागरिक |
| `who.all` | Every person | हर व्यक्ति |
| `rights.note.articlesection` | An Article is the big promise. A section of a law (BNSS, BNS) gives the exact procedure. | अनुच्छेद बड़ा वादा करता है। कानून की धारा (BNSS, BNS) सटीक प्रक्रिया बताती है। |
| `rights.note.calm` | Say it calmly and politely. Quoting an Article does not give you power to stop the police. Never use force. | शांति और विनम्रता से कहें। अनुच्छेद का नाम लेने से पुलिस को रोकने की शक्ति नहीं मिलती। बल का प्रयोग कभी न करें। |
| `practice.flip` | Tap to flip | पलटने के लिए छुएँ |
| `practice.known` | I know this | मुझे यह आता है |
| `practice.again` | Show again | फिर दिखाएँ |

---

## 3. Data shape and checker rules

```ts
type FRGroup = 'equality' | 'freedom' | 'exploitation' | 'religion' | 'cultural_educational' | 'remedies' | 'related';

interface FRArticle {
  id: string;                 // "art-22-1"
  article: string;            // "22(1)"  (search must also match "22", "art 22", "anuchhed 22", "अनुच्छेद 22")
  group: FRGroup;
  name: L10n;
  plain: L10n;                // what the right gives, in plain words
  who: 'citizens' | 'every_person' | 'children' | 'minorities' | 'denominations' | 'other';
  limits?: L10n;              // limits and gray areas
  atProtest?: L10n;           // how it helps at a protest (optional)
  scriptIds?: string[];       // e.g. ["S15"]
  moduleIds?: string[];       // e.g. ["M04"]
  refs?: string[];            // LawRef ids and case ids
  priority: 1 | 2 | 3;        // 1 = key; shown first and on the wallet card
  tags: string[];
  status: ReviewStatus;       // "ai_draft" for now
  draftedOn: string;
  lastVerified: string | null;
  verify: true;
}

interface ArticleFinderRow {
  id: string;
  problem: L10n;              // "Told to answer questions, confess, or sign"
  articles: string[];         // FRArticle ids
  plain: L10n;
  moduleIds?: string[];
  scriptIds?: string[];
}
```

**Add to `validate-content`:**
- Every `FRArticle.id`, `scriptIds`, `moduleIds`, `refs` and every `ArticleFinderRow.articles` points to something that exists.
- Exactly **eight** priority-1 "key number" groups exist: 14, 19, 20(3), 21, 22(1), 22(2), 32, 226 (the four 19(1) rows count as the "19" group).
- Every FRArticle has `en`, and `hi` for `name` (warn if `plain.hi` is missing).
- No `http` links in content.

---

## 4. Prompts for the AI (paste one by one)

> Start with: **"Read docs/PHASE_13.md in full. Follow the Master Prompt rules from earlier. Do not invent or change any legal claim or Article number."**

### Prompt 13A — Content files
```
Create the Phase 13 content from docs/PHASE_13.md section 2:
1. src/content/fundamental-rights.json from section 2.4 (every row; keep Hindi where given; for rows without
   Hindi plain-words, write simple Hindi drafts and set "translation":"ai_draft").
2. src/content/articleFinder.json from section 2.3.
3. Add scripts S15-S20 to scripts.json from section 2.5, with warnings and the "say it well" tips.
4. Add the new law references (2.6) to lawrefs.json and the new cases (2.7) to cases.json, all verify:true.
5. Add module M14 from section 2.8 as src/content/modules/M14.json (status ai_draft, draftedOn 2026-10-09, lastVerified null).
6. Add the new UI strings from 2.10 to en.json and hi.json.
7. Update the types (section 3) and scripts/validate-content.ts with the new rules. Update scripts/export-review.ts
   so the new Articles, cases, and references appear in REVIEW.md.
Run npm run validate and npm run build. Fix errors. Tell me what to check.
```
**You should see:** `npm run validate` passes. The count of items needing review has gone up. `REVIEW.md` now lists the Articles.

### Prompt 13B — The Article screens
```
Build these screens in the same style as the rest of the app:
1. /rights — a big search box at the top that accepts numbers. Typing "22" shows all Article 22 cards;
   typing "19(1)(b)" or "19 1 b" shows that card; also match "art 22", "anuchhed 22", "अनुच्छेद 22".
   Below the search, pin the "8 key numbers" (priority 1) as large tiles using the memory tricks from section 2.2.
   Then list the other cards grouped by FRGroup. Show the notes from section 2.1 in a collapsible "Read before you quote an Article".
2. /rights/:id — an Article card: the Article number in very large type, the name, "in plain words", "Who is covered"
   (use the "Citizens only"/"Every person" label), "Limits", "How it helps at a protest", a "Say it" button that opens the
   linked script in Show-to-officer mode, links to related modules and cases (collapsed under "Legal basis"),
   the review badge, and the DRAFT banner.
3. /rights/finder — the problem-to-Article table from section 2.3 as tappable rows.
4. Add a "Know your Articles" button to Home (below the "Protest rights" button) and links in the footer.
Use only strings from section 2.10 and the main plan. Buttons at least 48dp. Works one-handed on a 360x640 screen.
```
**You should see:**
- Home has a new "Know your Articles" button.
- `/rights` shows the 8 key tiles. Typing `22` in the search shows Article 22(1), 22(2), and 22(3)–(7).
- Tapping "Article 21" opens a card with big "21", the plain meaning, and a DRAFT banner.
- Switching to **हि** shows Hindi (with the "English only" badge where Hindi is missing).

### Prompt 13C — Connect everything together
```
Integrate the Articles with the rest of the app:
1. In every module, make each constitution law-reference chip (for example "Art. 22(1)") a tappable link to its Article card.
2. Add the Articles to global search (/library) so searching "21", "article 21", "anuchhed 21", "privacy", or "silent"
   finds the right cards. Include Hindi and Hinglish tags.
3. On each Article card, show the linked scripts and modules; on each script screen, show the Article(s) it quotes as chips.
4. Add the "8 key numbers" block and script S20 (English + Hindi) to the wallet card, if a wallet card exists.
   If it does not exist yet, create a print-friendly /wallet-card page (A6 size) with the Ten Golden Rules (M01),
   the 8 key numbers, S01-S07 and S20, and the emergency numbers.
5. Make sure the new pages are included in the offline precache.
Run validate and build.
```
**You should see:** In module M04 (Being arrested), tap "Art. 22(1)" and it opens the card. Searching `silent` finds Article 20(3). `/wallet-card` prints nicely (try Print preview).

### Prompt 13D — Practice mode (flash cards)
```
Build /rights/practice with flash cards from priority-1 and priority-2 Articles:
- Mode 1: show the Article number, tap to flip and see the right in plain words.
- Mode 2: show the plain-words right, tap to flip and see the Article number.
- Buttons "I know this" and "Show again"; shuffle the deck; show how many are left.
- Save the "known" list encrypted with the existing storage layer (no PIN = plain storage, with the usual warning).
- Large text, high contrast, works offline.
```
**You should see:** You can flip cards, mark them known, and the "known" list is still there after you close and reopen the app.

### Prompt 13E — Test, rebuild, release
```
Run the full QA from the plan's section 11 again, plus these Phase 13 checks:
- Every Article card opens; every script S15-S20 opens in Show-to-officer mode.
- Typing a number in /rights finds the right cards (test: 14, 19, 19(1)(b), 20(3), 21, 22, 32, 226).
- No page makes a network request; airplane mode works.
- English and Hindi both work; missing Hindi shows "English only".
Then update CHANGELOG.md (version 0.2.0 - Phase 13: Fundamental Rights) and bump content_version in meta.json.
Report anything that fails.
```

---

## 5. After the AI finishes — rebuild and share the new version

1. **Save:** `git add .` then `git commit -m "Phase 13: Fundamental Rights"`.
2. **Test offline in the browser:** `npm run build`, then `npm run preview`, then DevTools → Network → Offline. Open `/rights`, an Article card, and the practice mode.
3. **Update the web app:** drag the new `dist` folder onto your Netlify site again. On phones, open the link once while online so the update is saved.
4. **Update the APK:** push to GitHub (`git push`) and run the **Build Android APK** workflow again.
   - Ask the AI: *"Set Android versionCode from the GitHub run number and versionName from content_version, in the workflow, so a new APK installs over the old one."* (Android refuses to update to an APK that does not have a higher version number.)
   - Use the **same signing key** as before. If you used the temporary test key, people must uninstall the old app first, which erases their saved notes.
5. **Send the new review file:** run `npm run export:review` and send the updated `REVIEW.md` to your lawyers, pointing them to the new "Fundamental Rights" section.

---

## 6. What a lawyer should check especially in Phase 13

- [ ] Wording of each Article (in particular 19(1)(a)–(d), 19(2)–(5), 20, 21, 22) against the official Constitution text, in English and the official Hindi text.
- [ ] Which Articles apply to **citizens only** and which to **every person**.
- [ ] Article 22(3)–(7): the exact preventive detention safeguards, and whether the three-month Advisory Board rule is stated correctly.
- [ ] The notes on Article 20(3): fingerprints/handwriting samples, and the unsettled position on phone unlocking.
- [ ] The notes on 19(1)(b): limits on blocking roads and on bandhs; the five new case citations.
- [ ] Hindi terms and the Hindi form of sub-clauses ((क), (ख), (ग), (घ)).
- [ ] Whether the sentences in scripts S15–S20 are legally accurate and not likely to cause harm if said to an officer.

**Reminder:** Keep the DRAFT banners on until a lawyer approves these items. Articles tell you the principle; they do not change how a particular officer behaves in the moment. Keep the app honest and point people to a lawyer and legal aid (**15100**).
