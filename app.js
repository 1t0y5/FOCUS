const qs = new URLSearchParams(location.search);
const mode = qs.get('mode') || 'casual';
const thread = document.getElementById('thread');
const quick = document.getElementById('quick');
const input = document.getElementById('input');
const composer = document.getElementById('composer');
const endWrap = document.querySelector('.end');

let userTurns = 0;
let conversation = [];

const openings = {
  thought: 'まとまっていなくても大丈夫。今浮かんでいることを、そのまま聞かせて。',
  feeling: '急がなくて大丈夫。今の気持ちに近いところから始めよう。',
  unknown: '分からないままで大丈夫。まずは今に近いものを選んでみよう。',
  casual: 'なんとなくでいいよ。今に近いものから始めよう。'
};

const initialOptions = {
  thought: ['仕事のこと', '人間関係のこと', 'これからのこと', '自分で書く'],
  feeling: ['少しモヤモヤしている', '疲れている', '落ち着いている', 'うまく言葉にできない'],
  unknown: ['今日あったこと', '今気になっていること', 'これからしたいこと', 'まだ選べない'],
  casual: ['今日のこと', '最近のこと', '少し先のこと', '何も決まっていない']
};

function time() {
  return new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

function add(text, who) {
  const d = document.createElement('div');
  d.className = 'msg ' + who;
  d.innerHTML = `${escapeHtml(text).replace(/\n/g, '<br>')}<div class="time">${time()}</div>`;
  thread.appendChild(d);
  conversation.push({ who, text });
  requestAnimationFrame(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
}

function escapeHtml(text) {
  return text.replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));
}

function showOptions(items) {
  quick.innerHTML = '';
  if (!items || !items.length) return;

  items.forEach(label => {
    const b = document.createElement('button');
    b.className = 'quick';
    b.type = 'button';
    b.textContent = label;
    b.onclick = () => {
      if (label === '自分で書く') {
        quick.innerHTML = '';
        input.focus();
        return;
      }
      quick.innerHTML = '';
      userSend(label);
    };
    quick.appendChild(b);
  });
}

function getReply(text) {
  const t = text.trim();

  if (/仕事|会社|上司|転職/.test(t)) {
    return {
      text: 'そのことが、今も心に残っているんだね。\n今はどちらに近い？',
      options: ['出来事そのものが引っかかる', '自分の受け止め方が気になる', 'どちらとも言えない', '自分で書く']
    };
  }

  if (/不安|怖|心配|モヤ/.test(t)) {
    return {
      text: 'まだ正体がはっきりしない気持ちかもしれないね。\n今の自分が守ろうとしているものに近いのは？',
      options: ['安心', '人との関係', '将来の選択肢', 'まだ分からない', '自分で書く']
    };
  }

  if (/嬉|楽しい|良かった|最高/.test(t)) {
    return {
      text: 'その感情は残しておきたいね。\nいちばん近いのはどれ？',
      options: ['認められたこと', '自分でできたこと', '誰かと共有できたこと', 'うまく言えない', '自分で書く']
    };
  }

  if (/疲|しんど|無理|何もしたくない/.test(t)) {
    return {
      text: '今日は、動くことより負担を減らしたい自分もいるのかもしれないね。\n今ほしいものに近いのは？',
      options: ['少し休む時間', '誰かに話すこと', 'やることを減らすこと', 'まだ分からない', '自分で書く']
    };
  }

  if (/出来事そのもの|受け止め方|どちらとも/.test(t)) {
    return {
      text: 'そこをもう少しだけ見てみよう。\n今日の場面を一つ挙げるなら、どんな時だった？',
      options: null
    };
  }

  if (/安心|人との関係|将来の選択肢/.test(t)) {
    return {
      text: 'それを守りたい自分がいるんだね。\n今の自分にとって、なぜそれが大切なんだろう？',
      options: null
    };
  }

  if (/まだ分からない|まだ選べない|何も決まっていない|うまく言葉にできない/.test(t)) {
    return {
      text: '決めなくて大丈夫。\n今日の中で、少しだけ心に残っている場面はある？',
      options: ['仕事や学校の場面', '誰かと話した場面', '一人で過ごした時間', '特に思い当たらない', '自分で書く']
    };
  }

  if (userTurns >= 3) {
    return {
      text: 'ここまで話してみて、最初より少し見え方が変わったところはある？',
      options: ['少し整理できた', 'まだ話したい', '別の見方が浮かんだ', '自分で書く']
    };
  }

  return {
    text: 'そう感じたんだね。\n今の話の中で、自分でも少し気になった言葉はどれ？',
    options: null
  };
}

function maybeShowEnd() {
  if (userTurns >= 3) {
    endWrap.classList.add('visible');
  }
}

function userSend(text) {
  if (!text.trim()) return;
  add(text, 'user');
  userTurns += 1;
  sessionStorage.setItem('focusLast', text);
  sessionStorage.setItem('focusConversation', JSON.stringify(conversation));
  showOptions([]);

  const response = getReply(text);
  setTimeout(() => {
    add(response.text, 'ai');
    showOptions(response.options);
    maybeShowEnd();
  }, 550);
}

add(openings[mode], 'ai');
showOptions(initialOptions[mode]);

composer.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value;
  input.value = '';
  userSend(text);
});
