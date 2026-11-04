import React, {useState,useEffect,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {draw,confirm,eligible} from './logic.mjs';
import './style.css';
type Song={id:string,title:string,artist:string,used:boolean};
type Person={id:string,name:string,songs:Song[]};
type State={people:Person[],bag:string[],history:{id:string,person:string,title:string,artist:string,time:string,manual:boolean}[]};
type Result={personId:string,songId:string};
const uid=()=>crypto.randomUUID();
const demo:State={people:['お父さん','お母さん','わたし'].map((name,i)=>({id:uid(),name,songs:[['小さな恋のうた','MONGOL800'],['チェリー','スピッツ'],['マリーゴールド','あいみょん']].map(([title,artist],j)=>({id:uid(),title,artist,used:false}))})),bag:[],history:[]};
function load():State {try {const s=JSON.parse(localStorage.getItem('karaoke-v1')||'null');if(s && Array.isArray(s.people)&&Array.isArray(s.bag)&&Array.isArray(s.history)&&s.people.every((p:any)=>typeof p.id==='string'&&typeof p.name==='string'&&Array.isArray(p.songs)&&p.songs.every((x:any)=>typeof x.id==='string'&&typeof x.title==='string'&&typeof x.artist==='string'&&typeof x.used==='boolean')))return s;}catch{} return demo;}
function App(){
 const [state,setState]=useState<State>(load),[page,setPage]=useState('main'),[result,setResult]=useState<Result|null>(null),[phase,setPhase]=useState(''),[flash,setFlash]=useState(''),[error,setError]=useState(''),[selected,setSelected]=useState<string[]>([]);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 useEffect(()=>{try{localStorage.setItem('karaoke-v1',JSON.stringify(state));setError('')}catch{setError('保存できません。ブラウザの空き容量・設定を確認してください。')}},[state]);
 const person=state.people.find(p=>p.id===result?.personId),song=person?.songs.find(s=>s.id===result?.songId);
 function roll(){
 const next=draw(state) as Result|null;if(!next)return;setResult(null);setPhase('次に歌う人');
 let tick=0;
 function animate(){tick++;const ps=eligible(state);const p=ps[tick%ps.length];setFlash(tick<10?p.name:state.people.find(p=>p.id===next!.personId)!.songs.filter(s=>!s.used)[tick%state.people.find(p=>p.id===next!.personId)!.songs.filter(s=>!s.used).length].title);if(tick===10)setPhase('歌う曲');if(tick<20)timer.current=setTimeout(animate,55+tick*9);else{setResult(next);setPhase('');}}
 animate();
 }
 function save(manual=false){if(!result)return;setState(s=>confirm(s,result,manual));setResult(null);}
 function update(p:Person){setState(s=>({...s,people:s.people.map(x=>x.id===p.id?p:x)}));setResult(null);}
 return <div className="app"><header><a href="#" onClick={()=>setPage('main')}>♫ Karaoke Roulette</a><button aria-label="設定" disabled={!!phase} onClick={()=>{setResult(null);setPage(page==='main'?'manage':'main')}}>{page==='main'?'⚙':'戻る'}</button></header>{error&&<p role="alert">{error}</p>}
 {page==='main'?<main className="hero"><p className="eyebrow">家族で、次の一曲を。</p><h1>だれが、なにを歌う？</h1><div className={'result '+(phase?'spinning':'')} aria-live="polite">{phase?<><small>{phase}を抽選中</small><h2>{flash}</h2></>:result?<><small>次のステージは</small><h2>{person?.name}</h2><h3>{song?.title}</h3><p>{song?.artist}</p></>:<><span className="note">♫</span><h2>みんなの出番を、均等に。</h2><p>登録曲から今日の一曲を選びましょう</p></>}</div>
 {result?<div className="actions"><button className="primary" onClick={()=>save()}>この曲で確定</button><button aria-label="再抽選" title="再抽選" onClick={roll}>↻</button></div>:<button className="primary" disabled={!!phase||!eligible(state).length} onClick={roll}>{phase?'抽選中…':'ルーレットを回す'}</button>}
 {!eligible(state).length&&<p>対象曲がありません。設定から曲を追加・再追加してください。</p>}<p className="muted">確定するまで履歴には記録されません</p><button disabled={!!phase} onClick={()=>setPage('history')}>履歴を見る · {state.history.length}</button></main>:<main><nav>{['manage','manual','history'].map((x,i)=><button className={page===x?'active':''} onClick={()=>{setPage(x);setResult(null)}} key={x}>{['家族・曲','手動選択','履歴'][i]}</button>)}</nav>
 {page==='manage'&&<><h1>家族と曲の管理</h1><form onSubmit={e=>{e.preventDefault();const f=e.currentTarget;const name=String(new FormData(f).get('name')).trim();if(name)setState(s=>({...s,people:[...s.people,{id:uid(),name,songs:[]}]}));f.reset()}}><input name="name" placeholder="家族の名前" required maxLength={80}/><button>家族を追加</button></form>
 {state.people.map(p=><section key={p.id}><input aria-label="家族名" value={p.name} onChange={e=>update({...p,name:e.target.value})}/><button onClick={()=>{if(window.confirm('この家族と登録曲を削除しますか？'))setState(s=>({...s,people:s.people.filter(x=>x.id!==p.id)}))}}>家族を削除</button>
 <form onSubmit={e=>{e.preventDefault();const f=e.currentTarget,d=new FormData(f);const title=String(d.get('title')).trim();if(title)update({...p,songs:[...p.songs,{id:uid(),title,artist:String(d.get('artist')).trim(),used:false}]});f.reset()}}><input name="title" placeholder="曲名" required/><input name="artist" placeholder="アーティスト"/><button>曲を追加</button></form>
 {p.songs.map(s=><div className="song" key={s.id}>{s.used&&<input type="checkbox" aria-label={s.title+'を再追加'} checked={selected.includes(s.id)} onChange={e=>setSelected(xs=>e.target.checked?[...xs,s.id]:xs.filter(id=>id!==s.id))}/>}<div><input aria-label="曲名" value={s.title} onChange={e=>update({...p,songs:p.songs.map(x=>x.id===s.id?{...x,title:e.target.value}:x)})}/><input aria-label="アーティスト" value={s.artist} onChange={e=>update({...p,songs:p.songs.map(x=>x.id===s.id?{...x,artist:e.target.value}:x)})}/><small>{s.used?'抽選済み':'抽選対象'}</small></div><button aria-label={s.title+'を削除'} onClick={()=>{if(window.confirm('この曲を削除しますか？'))update({...p,songs:p.songs.filter(x=>x.id!==s.id)})}}>×</button></div>)}</section>)}<button disabled={!selected.length} onClick={()=>{setState(s=>({...s,people:s.people.map(p=>({...p,songs:p.songs.map(x=>selected.includes(x.id)?{...x,used:false}:x)}))}));setSelected([])}}>チェックした曲を再追加 ({selected.length})</button></>}
 {page==='manual'&&<><h1>手動で選ぶ</h1><p>確定すると履歴と今回の一巡に反映されます。</p><select aria-label="家族" value={result?.personId||''} onChange={e=>setResult({personId:e.target.value,songId:''})}><option value="">家族を選択</option>{eligible(state).map((p:Person)=><option value={p.id} key={p.id}>{p.name}</option>)}</select><select aria-label="曲" value={result?.songId||''} onChange={e=>setResult({...result!,songId:e.target.value})}><option value="">曲を選択</option>{person?.songs.filter(s=>!s.used).map(s=><option key={s.id} value={s.id}>{s.title} / {s.artist}</option>)}</select><button className="primary" disabled={!song} onClick={()=>save(true)}>確定する</button></>}
 {page==='history'&&<><h1>歌った履歴</h1>{!state.history.length&&<p>まだ履歴はありません。</p>}{state.history.map(h=><section key={h.id}><small>{new Date(h.time).toLocaleString('ja-JP')}{h.manual?' · 手動':''}</small><h3>{h.person} — {h.title}</h3><p>{h.artist}</p></section>)}<button disabled={!state.history.length} onClick={()=>{if(window.confirm('履歴と一巡の進行をリセットしますか？ 抽選済み曲はそのままです。'))setState(s=>({...s,history:[],bag:[]}))}}>履歴をリセット</button></>}
 </main>}<footer>歌う時間を、もっと楽しく。</footer></div>
}createRoot(document.getElementById('root')!).render(<App/>);
