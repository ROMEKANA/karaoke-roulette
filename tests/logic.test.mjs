import {test} from 'node:test';
import assert from 'node:assert/strict';
import {draw,confirm} from '../src/logic.mjs';
const initial=()=>({people:['a','b','c'].map(id=>({id,name:id,songs:[1,2,3].map(n=>({id:id+n,title:'song',artist:'artist',used:false}))})),bag:[],history:[]});
test('one round includes each member once; draws do not mutate state',()=>{
 let s=initial();const seen=new Set();
 for(let i=0;i<3;i++){const before=JSON.stringify(s);const r=draw(s);draw(s);assert.equal(JSON.stringify(s),before);assert.ok(!seen.has(r.personId));seen.add(r.personId);s=confirm(s,r)}
 assert.equal(s.history.length,3);assert.equal(seen.size,3);
});
test('manual confirmation consumes turn and used song; empty members excluded',()=>{
 let s=initial();s.people[2].songs=[];s=confirm(s,{personId:'a',songId:'a1'},true);
 assert.equal(draw(s).personId,'b');assert.equal(s.history[0].manual,true);
 assert.equal(confirm(s,{personId:'a',songId:'a1'}),s);
});
test('no available songs returns null',()=>{const s=initial();s.people.forEach(p=>p.songs.forEach(x=>x.used=true));assert.equal(draw(s),null)});
