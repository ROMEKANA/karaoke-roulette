export function eligible(state) { return state.people.filter(p => p.songs.some(s => !s.used)); }
export function bagFor(state) {
 const ids = eligible(state).map(p => p.id);
 const bag = state.bag.filter(id => ids.includes(id));
 return bag.length ? bag : [...ids].sort(() => Math.random() - .5);
}
export function draw(state) {
 const bag = bagFor(state);
 const person = state.people.find(p => p.id === bag[Math.floor(Math.random()*bag.length)]);
 if (!person) return null;
 const songs = person.songs.filter(s => !s.used);
 return {personId:person.id, songId:songs[Math.floor(Math.random()*songs.length)].id};
}
export function confirm(state, result, manual=false) {
 const person=state.people.find(p=>p.id===result.personId);
 const song=person?.songs.find(s=>s.id===result.songId);
 if (!song || song.used) return state;
 const bag=bagFor(state).filter(id=>id!==person.id);
 return {...state,bag,people:state.people.map(p=>({...p,songs:p.songs.map(s=>p.id===person.id && s.id===song.id?{...s,used:true}:s)})),history:[{id:crypto.randomUUID(),person:person.name,title:song.title,artist:song.artist,time:new Date().toISOString(),manual},...state.history]};
}
