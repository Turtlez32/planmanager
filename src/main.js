import './styles.css';

const plans = [
  { title: 'Project Northstar', owner: 'Codex', date: '18 Aug', progress: 78, tone: 'mint', tag: 'In review' },
  { title: 'Turtleware Launch', owner: 'Claude', date: '17 Aug', progress: 42, tone: 'violet', tag: 'In progress' },
  { title: 'MCP Agent Handoff', owner: 'Codex', date: '14 Aug', progress: 91, tone: 'coral', tag: 'Ready' },
  { title: 'Research Archive', owner: 'Admin', date: '09 Aug', progress: 24, tone: 'gold', tag: 'Draft' },
  { title: 'Viewer Refresh', owner: 'Claude', date: '02 Aug', progress: 64, tone: 'blue', tag: 'In progress' },
];

const icons = { search: '⌕', add: '+', arrow: '↗', dots: '•••', clock: '◷' };
const nav = ['Overview', 'Plans', 'Activity', 'Team'];
const columns = [
  ['Draft', plans.filter(plan => plan.tag === 'Draft')],
  ['In motion', plans.filter(plan => plan.tag === 'In progress')],
  ['Review', plans.filter(plan => plan.tag === 'In review' || plan.tag === 'Ready')],
];

document.querySelector('#app').innerHTML = `
  <div class="app design-orbit">
    <header class="topbar">
      <a class="brand" href="#" aria-label="PlanManager home"><span class="brand-mark">P</span><span>PlanManager</span></a>
      <nav class="main-nav" aria-label="Primary">
        ${nav.map(item => `<button class="nav-item ${item === 'Overview' ? 'active' : ''}" data-nav>${item}</button>`).join('')}
      </nav>
      <div class="top-actions"><button class="icon-button" aria-label="Search">${icons.search}</button><span class="avatar">TW</span></div>
    </header>
    <main class="orbit-main">
      <section class="orbit-head">
        <div><p class="kicker">Mission control</p><h1>Plan the work.<br><span>Move the mission.</span></h1></div>
        <div class="orbit-actions"><button class="outline-action">Invite team</button><button class="primary-action">${icons.add} Create plan</button></div>
      </section>
      <section class="orbit-stats" aria-label="Workspace summary">
        <div><span class="pulse"></span><strong>5</strong><p>Live plans</p></div>
        <div><strong>3</strong><p>Collaborators</p></div>
        <div><strong>18</strong><p>Changes this week</p></div>
        <div class="next-review"><span>Next review</span><b>Today · 3:30 PM</b><button aria-label="Open next review">${icons.arrow}</button></div>
      </section>
      <section class="board">
        <div class="board-head"><h2>Active flightboard</h2><div><button class="filter active">All plans</button><button class="filter">Mine</button><button class="icon-button" aria-label="More options">${icons.dots}</button></div></div>
        <div class="columns">
          ${columns.map(([title, items], columnIndex) => `<div class="column">
            <div class="column-head"><h3>${title}</h3><span>0${items.length}</span></div>
            ${items.map(plan => `<article class="orbit-card">
              <div class="card-top"><span class="orbit-icon ${plan.tone}">${['◇', '◎', '△'][columnIndex]}</span><button aria-label="Options for ${plan.title}">${icons.dots}</button></div>
              <h4>${plan.title}</h4>
              <p>${columnIndex === 0 ? 'Shape the brief and define a clear path forward.' : columnIndex === 1 ? 'Core work is underway with the team in sync.' : 'Final details are ready for a careful look.'}</p>
              <div class="card-meta"><span class="mini-avatar">${plan.owner.slice(0, 1)}</span><span>${icons.clock} ${plan.date}</span><b>${plan.progress}%</b></div>
              <div class="orbit-progress"><i style="width:${plan.progress}%"></i></div>
            </article>`).join('')}
            <button class="add-card">+ Add plan</button>
          </div>`).join('')}
        </div>
      </section>
    </main>
  </div>`;

document.querySelectorAll('[data-nav]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-nav]').forEach(item => item.classList.toggle('active', item === button));
}));

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(item => item.classList.toggle('active', item === button));
}));
