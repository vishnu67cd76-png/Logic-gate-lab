const gateData = {
  AND:{inputs:2, desc:"Output HIGH only if all inputs HIGH.", formula:"Y = A . B", logic:(...args)=> args.every(v=>v), svg:`<svg viewBox="0 0 100 60"><path d="M10,10 L40,10 C60,10 60,50 40,50 L10,50 Z"/></svg>`, table:[[0,0,0],[0,1,0],[1,0,0],[1,1,1]]},
  OR:{inputs:2, desc:"Output HIGH if any input HIGH.", formula:"Y = A + B", logic:(...args)=> args.some(v=>v), svg:`<svg viewBox="0 0 100 60"><path d="M10,10 Q40,10 50,30 Q40,50 10,50 Q25,30 10,10"/></svg>`, table:[[0,0,0],[0,1,1],[1,0,1],[1,1,1]]},
  NOT:{inputs:1, desc:"Reverses input.", formula:"Y = A'", logic:(a)=>!a, svg:`<svg viewBox="0 0 100 60"><path d="M20,10 L60,30 L20,50 Z"/><circle cx="65" cy="30" r="5"/></svg>`, table:[[0,1],[1,0]]},
  NAND:{inputs:2, desc:"AND then NOT. LOW only if all HIGH.", formula:"Y = (A . B)'", logic:(...args)=>!args.every(v=>v), svg:`<svg viewBox="0 0 100 60"><path d="M10,10 L40,10 C60,10 60,50 40,50 L10,50 Z"/><circle cx="65" cy="30" r="5"/></svg>`, table:[[0,0,1],[0,1,1],[1,0,1],[1,1,0]]},
  NOR:{inputs:2, desc:"OR then NOT. HIGH only if all LOW.", formula:"Y = (A + B)'", logic:(...args)=>!args.some(v=>v), svg:`<svg viewBox="0 0 100 60"><path d="M10,10 Q40,10 50,30 Q40,50 10,50 Q25,30 10,10"/><circle cx="55" cy="30" r="5"/></svg>`, table:[[0,0,1],[0,1,0],[1,0,0],[1,1,0]]},
  XOR:{inputs:2, desc:"Output HIGH only if inputs differ.", formula:"Y = A ⊕ B", logic:(a,b)=>a!==b, svg:`<svg viewBox="0 0 100 60"><path d="M20,10 Q50,10 60,30 Q50,50 20,50 Q35,30 20,10"/><path d="M10,10 Q25,30 10,50" stroke-width="2"/></svg>`, table:[[0,0,0],[0,1,1],[1,0,1],[1,1,0]]},
  XNOR:{inputs:2, desc:"Output HIGH only if inputs same.", formula:"Y = (A ⊕ B)'", logic:(a,b)=>a===b, svg:`<svg viewBox="0 0 100 60"><path d="M20,10 Q50,10 60,30 Q50,50 20,50 Q35,30 20,10"/><path d="M10,10 Q25,30 10,50" stroke-width="2"/><circle cx="65" cy="30" r="5"/></svg>`, table:[[0,0,1],[0,1,0],[1,0,0],[1,1,1]]}
};

let currentGate = 'AND';
let inputStates = [];

window.onload = ()=> loadGate('AND');

function loadGate(name){
  currentGate=name;
  const data=gateData[name];

  document.getElementById('current-gate-title').innerText=name+" Gate";
  document.getElementById('gate-description').innerText=data.desc;
  document.getElementById('formula').innerText=data.formula;
  document.getElementById('gate-svg-container').innerHTML=data.svg;

  inputStates=new Array(data.inputs).fill(0);
  renderInputs(data.inputs);
  calculateLogic();
  renderTable(data.table,data.inputs);

  document.querySelectorAll('.nav-btn').forEach(btn=>{
    btn.classList.remove('active');
    if(btn.dataset.gate === name) btn.classList.add('active');
  });
}

function renderInputs(count){
  const container=document.getElementById('input-container');
  container.innerHTML='';
  for(let i=0;i<count;i++){
    const label=String.fromCharCode(65+i);
    const wrapper=document.createElement('div');
    wrapper.className='switch-container';
    wrapper.innerHTML=`<div class="switch-label">${label}</div>
      <div class="toggle-switch" onclick="toggleInput(${i},this)">
        <div class="toggle-knob"></div>
      </div>
      <div class="switch-label" id="val-${i}">0</div>`;
    container.appendChild(wrapper);
  }
}

function toggleInput(index,el){
  inputStates[index]=inputStates[index]===0?1:0;
  el.classList.toggle('active');
  document.getElementById(`val-${index}`).innerText=inputStates[index];
  calculateLogic();
}

function calculateLogic(){
  const fn=gateData[currentGate].logic;
  const result=inputStates.length===1?fn(inputStates[0]):fn(...inputStates);
  document.getElementById('output-bulb').classList.toggle('on',!!result);
}

function resetInputs(){
  inputStates=inputStates.map(()=>0);
  document.querySelectorAll('.toggle-switch').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.switch-container .switch-label:last-child').forEach(el=>el.innerText='0');
  calculateLogic();
}

function renderTable(rows, inputCount) {
  const table = document.getElementById('truth-table-el');

  let header = '<tr>';
  for (let i = 0; i < inputCount; i++) {
    header += `<th>${String.fromCharCode(65 + i)}</th>`;
  }
  header += '<th>Y</th><th>Action</th></tr>';

  const body = rows.map((r, rowIndex) => {
    const cells = r.map(c => `<td>${c}</td>`).join('');

    return `
      <tr>
        ${cells}
        <td>
          <button class="try-btn" onclick="applyTruthRow(${rowIndex})">Try</button>
        </td>
      </tr>`;
  }).join('');

  table.innerHTML = header + body;
}

function applyTruthRow(index) {
  const rows = gateData[currentGate].table;
  const selected = rows[index];

  // Update input states
  for (let i = 0; i < inputStates.length; i++) {
    inputStates[i] = selected[i];

    const switchEl = document.querySelectorAll('.toggle-switch')[i];
    const valEl = document.getElementById(`val-${i}`);

    if (selected[i] === 1) switchEl.classList.add('active');
    else switchEl.classList.remove('active');

    valEl.innerText = selected[i];
  }

  calculateLogic();
}

function switchTab(tab){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  event.target.classList.add('active');
}

function toggleColorMode(){
  const root=document.documentElement;
  const current=root.style.getPropertyValue('--neon-blue') || '#00f3ff';
  const newColor=current==='#00f3ff'?'#ff00ff':'#00f3ff';
  root.style.setProperty('--neon-blue',newColor);
}
