// Runs only inside the trusted editor WebView. Learner code runs in a separate opaque-origin iframe.
function boot(config) {
  const $ = id => document.getElementById(id);
  let files = config.workspace.files.map(file => ({...file}));
  let folders = [...config.workspace.folders];
  let revision = config.workspace.revision;
  let active = files[0].path;
  let tabs = [active];
  let dirty = false;
  let busy = false;
  let aiCode = '';
  let pending = null;
  let counter = 0;
  let consoleLines = [];
  const text = (id, value) => { $(id).textContent = value; };
  const log = message => { consoleLines.push(String(message)); if(consoleLines.length>200) consoleLines.shift(); text('console',consoleLines.join('\n')); };
  const term = message => { $('terminal-output').textContent += `${message}\n`; $('terminal-output').scrollTop = $('terminal-output').scrollHeight; };
  const send = (type,payload={}) => {
    const message = {channel:config.channel,id:++counter,type,...payload};
    if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
    else window.parent.postMessage(message,'*');
    return message.id;
  };
  const payload = () => ({files:files.map(f=>({...f})),folders:[...folders],revision});
  const changed = () => {dirty=true;text('save-status','Unsaved changes');send('dirty',{dirty:true});};
  const current = () => files.find(file=>file.path===active);
  const escape = value => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  function highlight() {
    const code=$('editor').value;
    // Token coloring is presentation only; source remains untouched in the textarea.
    const expression=/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:const|let|var|function|return|if|else|async|await|import|export|from|class|new|throw|try|catch|true|false|null)\b|\b\d+(?:\.\d+)?\b)/g;
    let result='',end=0,match;
    while((match=expression.exec(code))) {
      result+=escape(code.slice(end,match.index));
      const token=match[0], cls=/^(\/\/|\/\*|<!--)/.test(token)?'comment':/^["']/.test(token)?'string':/^\d/.test(token)?'number':'keyword';
      result+=`<span class="${cls}">${escape(token)}</span>`;end=expression.lastIndex;
    }
    $('highlight').innerHTML=result+escape(code.slice(end))+'\n';
    text('lines',Array.from({length:code.split('\n').length},(_,i)=>i+1).join('\n'));
    text('language',active.split('.').pop().toUpperCase());
    $('highlight').scrollTop=$('editor').scrollTop;$('highlight').scrollLeft=$('editor').scrollLeft;$('lines').scrollTop=$('editor').scrollTop;
  }
  function open(path) {
    if(!files.some(f=>f.path===path))return;
    active=path;if(!tabs.includes(path))tabs.push(path);
    $('editor').value=current().content;highlight();renderTree();renderTabs();
  }
  function renderTabs() {
    $('tabs').replaceChildren();
    tabs.forEach(path=>{const button=document.createElement('button');button.className=path===active?'tab selected':'tab';button.textContent=path;button.onclick=()=>open(path);$('tabs').append(button);});
  }
  function renderTree() {
    $('tree').replaceChildren();
    const allFolders = new Set(folders);
    files.forEach(file=>{const parts=file.path.split('/');for(let i=1;i<parts.length;i++)allFolders.add(parts.slice(0,i).join('/'));});
    const entries=[...Array.from(allFolders).map(path=>({path,folder:true})),...files.map(f=>({path:f.path,folder:false}))].sort((a,b)=>a.path.localeCompare(b.path));
    entries.forEach(entry=>{const row=document.createElement('div');row.className='tree-row';const button=document.createElement('button');button.className='file'+(active===entry.path?' active':'');button.textContent=(entry.folder?'▸ ':'◇ ')+entry.path;button.onclick=()=>entry.folder?term(`Folder: ${entry.path}`):open(entry.path);row.append(button);const menu=document.createElement('button');menu.textContent='⋯';menu.setAttribute('aria-label',`Manage ${entry.path}`);menu.onclick=()=>manage(entry.path,entry.folder);row.append(menu);$('tree').append(row);});
  }
  function modal(title,initial,onConfirm,destructive=false) {
    text('dialog-title',title);$('path-input').value=initial;$('path-input').hidden=destructive;
    $('dialog-confirm').textContent=destructive?'Confirm':'Save';$('dialog').showModal();
    $('dialog-confirm').onclick=()=>{try{onConfirm($('path-input').value.trim());$('dialog').close();}catch(e){text('dialog-error',e.message);}};
    text('dialog-error','');if(!destructive)$('path-input').focus();
  }
  function validPath(path) {
    return /^[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*$/.test(path) && path.length<=120 && !path.split('/').some(p=>['.','..','__proto__','constructor','prototype'].includes(p));
  }
  function ensurePath(path,except) {
    if(!validPath(path))throw new Error('Use a relative path with letters, digits, dots, dashes, or underscores.');
    if(files.some(f=>f.path===path && f.path!==except)||folders.some(f=>f===path && f!==except))throw new Error('That path already exists.');
    if(files.some(f=>f.path!==except && path.startsWith(f.path+'/')))throw new Error('A file cannot contain another path.');
  }
  function add(path,folder=false) {
    ensurePath(path);if(files.length+folders.length>=40)throw new Error('Keep the workspace within 40 entries.');
    if(folder)folders.push(path);else files.push({path,content:''});
    changed();renderTree();if(!folder)open(path);
  }
  function rename(path,next,folder) {
    ensurePath(next,path);if(next===path)return;
    if(folder && next.startsWith(path+'/'))throw new Error('A folder cannot move inside itself.');
    const replace = p=>p===path || (folder && p.startsWith(path+'/')) ? next+p.slice(path.length) : p;
    const nextFiles=files.map(f=>({...f,path:replace(f.path)}));const nextFolders=folders.map(replace);
    const names=[...nextFiles.map(f=>f.path),...nextFolders];if(new Set(names).size!==names.length)throw new Error('The rename conflicts with an existing path.');
    files=nextFiles;folders=nextFolders;active=replace(active);tabs=tabs.map(replace);changed();open(active);renderTree();
  }
  function remove(path,folder) {
    const match=p=>p===path || (folder && p.startsWith(path+'/'));
    if(files.filter(f=>!match(f.path)).length===0)throw new Error('Keep at least one project file.');
    files=files.filter(f=>!match(f.path));folders=folders.filter(f=>!match(f));tabs=tabs.filter(t=>!match(t));
    if(match(active))active=files[0].path;changed();open(active);renderTree();
  }
  function manage(path,folder) {
    $('file-actions').hidden=false;text('managed-path',path);
    $('rename-path').onclick=()=>{ $('file-actions').hidden=true;modal('Rename '+path,path,next=>rename(path,next,folder)); };
    $('delete-path').onclick=()=>{ $('file-actions').hidden=true;modal('Delete '+path+' and its contents?','',()=>remove(path,folder),true); };
  }
  $('editor').addEventListener('input',()=>{current().content=$('editor').value;changed();highlight();});
  $('editor').addEventListener('scroll',highlight);
  $('editor').addEventListener('keydown',event=>{
    if(event.key==='Tab'){event.preventDefault();const input=$('editor'),start=input.selectionStart,end=input.selectionEnd;input.setRangeText('  ',start,end,'end');current().content=input.value;changed();highlight();}
    if((event.metaKey||event.ctrlKey)&&event.key==='s'){event.preventDefault();request('save');}
  });
  $('new-file').onclick=()=>modal('Create file','',path=>add(path));
  $('new-folder').onclick=()=>modal('Create folder','',path=>add(path,true));
  $('dialog-cancel').onclick=()=>$('dialog').close();
  $('close-actions').onclick=()=>$('file-actions').hidden=true;
  function panel(name) {document.querySelectorAll('[data-panel]').forEach(el=>el.hidden=el.dataset.panel!==name);document.querySelectorAll('[data-tab]').forEach(el=>el.classList.toggle('selected',el.dataset.tab===name));}
  document.querySelectorAll('[data-tab]').forEach(button=>button.onclick=()=>panel(button.dataset.tab));
  document.querySelectorAll('button[data-mobile]').forEach(button=>button.onclick=()=>{document.body.dataset.mobile=button.dataset.mobile;document.querySelectorAll('button[data-mobile]').forEach(el=>el.classList.toggle('selected',el===button));});
  function request(type) {
    if(busy)return;
    busy=true;document.querySelectorAll('[data-request]').forEach(el=>el.disabled=true);
    const snapshot=payload();pending={id:send(type,{workspace:snapshot}),type,snapshot:JSON.stringify({files:snapshot.files,folders:snapshot.folders})};
    text('save-status',type==='save'?'Saving…':type==='submit'?'Submitting…':'Checking…');
  }
  $('save').onclick=()=>request('save');$('check').onclick=()=>request('check');$('submit').onclick=()=>request('submit');
  $('reset').onclick=()=>modal('Reset replaces the current editor files. Saved progress is retained.','',()=>{files=config.task.starterFiles.map(f=>({...f}));folders=[];tabs=[];active=files[0].path;changed();open(active);log('Editor reset to unfinished starter files.');},true);
  function pathFrom(base,path) {const parts=(base.includes('/')?base.slice(0,base.lastIndexOf('/')+1):'').split('/').filter(Boolean);for(const part of path.split('/')){if(part==='..')parts.pop();else if(part!=='.'&&part)parts.push(part);}return parts.join('/');}
  function run(entry='index.html') {
    if(config.module.runtime==='node'){panel('terminal');term('Node projects require a local Node runtime. This workspace does not execute server code. Export the project, run the README commands locally, then submit source checks here.');return;}
    const input=files.find(f=>f.path===entry);
    if(!input){panel('terminal');term('No index.html found. Document projects can be reviewed in the editor; export them to use alongside your local project.');return;}
    consoleLines=[];log('Running the current in-memory project…');
    const doc=new DOMParser().parseFromString(input.content,'text/html');
    doc.querySelectorAll('base').forEach(el=>el.remove());
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(link=>{const path=pathFrom(entry,link.getAttribute('href')||'');const file=files.find(f=>f.path===path);if(file){const style=doc.createElement('style');style.textContent=file.content;link.replaceWith(style);}else log(`Stylesheet not bundled: ${path}`);});
    const scripts=[];
    doc.querySelectorAll('script').forEach(script=>{const src=script.getAttribute('src');if(src){const path=pathFrom(entry,src);if(files.some(f=>f.path===path))scripts.push({path,module:script.type==='module'});else log(`Script not found in workspace: ${src}`);}else scripts.push({inline:script.textContent,module:script.type==='module'});script.remove();});
    const csp=doc.createElement('meta');csp.httpEquiv='Content-Security-Policy';csp.content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: https: http: blob:; media-src data: https: http: blob:; connect-src https: http:; font-src data:; form-action 'none'; base-uri 'none'";doc.head.prepend(csp);
    const runtime=doc.createElement('script');runtime.textContent=config.runtime;doc.head.append(runtime);
    const runner=doc.createElement('script');
    runner.textContent='('+previewBoot.toString()+')('+JSON.stringify({files,scripts,entry}).replace(/</g,'\\u003c')+');';
    doc.body.append(runner);
    $('preview').srcdoc='<!doctype html>'+doc.documentElement.outerHTML;
    panel('preview');
  }
  function previewBoot(project) {
    const emit=(level,args)=>{let message;try{message=args.map(a=>typeof a==='string'?a:JSON.stringify(a)).join(' ');}catch{message=String(args);}parent.postMessage({type:'preview-console',level,message},'*');};
    ['log','info','warn','error'].forEach(level=>{console[level]=(...args)=>emit(level,args);});
    addEventListener('error',event=>emit('error',[event.message]));addEventListener('unhandledrejection',event=>emit('error',[event.reason?.message || String(event.reason)]));
    const runtime=window.CurriculumRuntime;
    const packages={'react':runtime.React,'react-dom/client':runtime.ReactDOM,'react-router-dom':runtime.Router,'@reduxjs/toolkit':runtime.Toolkit,'react-redux':runtime.ReactRedux};
    const files=new Map(project.files.map(f=>[f.path,f.content]));const cache=new Map();
    function resolve(from,specifier){
      if(packages[specifier])return specifier;
      if(!specifier.startsWith('.'))throw new Error(`Package "${specifier}" is not installed in the browser preview. Supported: React, React Router, Redux Toolkit, React Redux. Export for a full local toolchain.`);
      const parts=from.split('/');parts.pop();for(const part of specifier.split('/')){if(part==='..')parts.pop();else if(part!=='.')parts.push(part);}const path=parts.join('/');
      const match=[path,path+'.js',path+'.jsx',path+'.ts',path+'.tsx',path+'/index.js',path+'/index.jsx'].find(p=>files.has(p));if(!match)throw new Error(`Module not found: ${specifier} from ${from}`);return match;
    }
    function load(path){
      if(packages[path])return packages[path];if(cache.has(path))return cache.get(path).exports;
      if(!files.has(path))throw new Error('File not found: '+path);
      if(path.endsWith('.css')){const style=document.createElement('style');style.textContent=files.get(path);document.head.append(style);return {};}
      if(path.endsWith('.json'))return JSON.parse(files.get(path));
      const module={exports:{}};cache.set(path,module);
      const presets=[['react',{runtime:'classic'}]];if(/\.tsx?$/.test(path))presets.push('typescript');
      const transformed=runtime.Babel.transform(files.get(path),{filename:path,presets,plugins:['transform-modules-commonjs']}).code;
      new Function('require','module','exports',transformed+'\n//# sourceURL=project/'+path)(specifier=>load(resolve(path,specifier)),module,module.exports);
      return module.exports;
    }
    for(const script of project.scripts){try{if(script.path){if(script.module || /\.[jt]sx$/.test(script.path))load(script.path);else (0,eval)(files.get(script.path)+'\n//# sourceURL=project/'+script.path);}else if(script.inline)(0,eval)(script.inline);}catch(error){emit('error',[error.message]);}}
    document.addEventListener('click',event=>{const link=event.target.closest?.('a[href]');if(!link)return;const href=link.getAttribute('href');if(href && !/^(#|https?:|mailto:|tel:)/.test(href)){event.preventDefault();parent.postMessage({type:'preview-navigate',path:href},'*');}});
    emit('info',['Preview started. Check interactions and errors before submitting.']);
  }
  $('run').onclick=()=>run();
  $('stop').onclick=()=>{$('preview').srcdoc='<p>Preview stopped.</p>';log('Preview stopped.');};
  window.addEventListener('message',event=>{
    if(event.source!==$('preview').contentWindow)return;
    if(event.data?.type==='preview-console')log(`[${event.data.level}] ${String(event.data.message).slice(0,4000)}`);
    if(event.data?.type==='preview-navigate'){const path=pathFrom('index.html',String(event.data.path));if(files.some(f=>f.path===path && path.endsWith('.html')))run(path);else log('Local page not found: '+path);}
  });
  $('terminal-form').onsubmit=event=>{
    event.preventDefault();const command=$('command').value.trim();$('command').value='';term('$ '+command);const [name,...args]=command.split(/\s+/);
    try{
      if(name==='help')term('Project terminal commands: ls, cat <path>, touch <path>, mkdir <path>, mv <old> <new>, rm <path>, run, check, save, clear. This is a project-file terminal, not an operating-system shell. Node/npm/Git commands must run in your local environment.');
      else if(name==='ls')term([...folders.map(f=>f+'/'),...files.map(f=>f.path)].sort().join('\n'));
      else if(name==='cat'){const file=files.find(f=>f.path===args[0]);if(!file)throw new Error('File not found');term(file.content);}
      else if(name==='touch')add(args[0]);
      else if(name==='mkdir')add(args[0],true);
      else if(name==='mv'){if(!args[1])throw new Error('Usage: mv old-path new-path');rename(args[0],args[1],folders.includes(args[0]));}
      else if(name==='rm')modal('Delete '+args[0]+'?','',()=>remove(args[0],folders.includes(args[0])),true);
      else if(name==='run')run();else if(name==='check')request('check');else if(name==='save')request('save');else if(name==='clear')text('terminal-output','');
      else term('Unsupported command. Type help for the available project commands.');
    }catch(error){term('Error: '+error.message);}
  };
  $('ask-form').onsubmit=event=>{event.preventDefault();if($('ask').disabled)return;const prompt=$('prompt').value.trim();if(!prompt)return;text('ai-reply','Thinking…');$('ask').disabled=true;send('ai',{prompt,model:$('ai-model').value,file:current(),requirements:config.task.requirements});};
  $('apply').onclick=()=>modal('Replace '+active+' with the reviewed AI code?','',()=>{current().content=aiCode;$('editor').value=aiCode;changed();highlight();},true);
  $('export').onclick=()=>send('export',{workspace:payload()});
  window.receiveHost = message => {
    if(message.channel!==config.channel)return;
    if(message.type==='ai-result'){$('ask').disabled=false;text('ai-reply',message.error || message.text);aiCode=message.code || '';$('apply').hidden=!aiCode;return;}
    if(message.type==='export-result'){text('save-status',message.error || 'Project export ready');return;}
    if(!pending || message.id!==pending.id)return;
    busy=false;document.querySelectorAll('[data-request]').forEach(el=>el.disabled=false);
    if(message.error){text('save-status',message.error);log(message.error);pending=null;return;}
    const result=message.result;
    const saved=pending.type==='save'?result:result.workspace;
    if(saved){revision=saved.revision;const unchanged=JSON.stringify({files,folders})===pending.snapshot;dirty=!unchanged;send('dirty',{dirty});text('save-status',unchanged?'Saved to your account':'Saved snapshot; newer edits remain unsaved');}
    if(result.checks){$('checks').replaceChildren();const note=document.createElement('p');note.textContent=result.note;$('checks').append(note);result.checks.forEach(check=>{const row=document.createElement('p');row.className=check.passed?'pass':'fail';row.textContent=(check.passed?'✓ ':'○ ')+check.message;$('checks').append(row);});panel('checks');if(!saved)text('save-status',dirty?'Unsaved changes':'Checks finished');if(pending.type==='submit'&&result.allPassed)text('save-status',result.reviewRequired?'Evidence saved — awaiting instructor review.':'Project requirements passed; progress saved to your account.');}
    pending=null;
  };
  const models=config.aiModels || [];
  models.forEach(model=>{const option=document.createElement('option');option.value=model.apiModel;option.textContent=model.name;$('ai-model').append(option);});
  if(models.some(model=>model.apiModel==='groq'))$('ai-model').value='groq';
  if(!models.length){$('ask').disabled=true;text('ai-reply','AI models are unavailable. Reopen the workspace to retry. Your editor and project checks remain available.');}
  text('project-title',config.task.title);text('task-problem',config.task.problem);text('reference',config.task.reference);
  config.task.requirements.forEach(requirement=>{const li=document.createElement('li');li.textContent=requirement;$('requirements').append(li);});
  text('runtime-note',config.module.runtime==='node'?'Node project: edit here, export and run locally. Source checks run on the server.':config.module.runtime==='document'?'Project evidence: author your deliverables here and export them alongside your real project.':'Browser preview supports HTML/CSS/JS and React with local modules. Use MemoryRouter for route demos in the isolated preview.');
  term('Project terminal ready. Type help for commands.');renderTree();open(active);send('ready');
}
export function workspaceDocument(config) {
 const serialized=JSON.stringify(config).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
 return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=5"><title>Project workspace</title><style>
*{box-sizing:border-box}body{margin:0;background:#fff;color:#17233b;font:14px system-ui,-apple-system,sans-serif}button,input,textarea,select{font:inherit}#ai-model{display:block;width:100%;min-height:44px;margin:8px 0 12px;padding:8px;background:white;color:#17233b;border:1px solid #dce2ed;border-radius:7px}button{min-height:40px;border:1px solid #dce2ed;border-radius:7px;background:#fff;color:#34425d;padding:8px 12px;cursor:pointer}button:hover{background:#f2f0ff}button:focus-visible,input:focus-visible,textarea:focus-visible{outline:3px solid #8d83ed;outline-offset:1px}button:disabled{opacity:.5;cursor:wait}.primary{background:#5145cd;color:white;border-color:#5145cd}.primary:hover{background:#4338b5}.selected{background:#f2f0ff!important;color:#5145cd!important}header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;border-bottom:1px solid #e4e8ef;flex-wrap:wrap}h1{font-size:16px;margin:0}h2{font-size:14px;margin:0 0 12px}p{line-height:1.65}.actions{display:flex;gap:8px;flex-wrap:wrap}.layout{display:grid;grid-template-columns:250px minmax(300px,1fr) 300px;height:calc(100vh - 122px);min-height:620px}.explorer,.assistant{padding:16px;overflow:auto}.explorer{border-right:1px solid #e4e8ef}.assistant{border-left:1px solid #e4e8ef;background:#fafbfe}.center{display:flex;flex-direction:column;min-width:0}.tabs{display:flex;gap:4px;overflow:auto;padding:8px;background:#f7f8fc;border-bottom:1px solid #e4e8ef;min-height:55px}.tab{white-space:nowrap;font-size:12px}.editor-wrap{position:relative;min-height:300px;flex:1;background:#fff;overflow:hidden}#editor,#highlight{position:absolute;inset:0 0 0 48px;margin:0;border:0;border-radius:0;padding:16px;white-space:pre;overflow:auto;font:14px/23px Menlo,Consolas,monospace;tab-size:2;letter-spacing:0;word-spacing:0}#editor{color:transparent;caret-color:#17233b;background:transparent;resize:none;-webkit-text-fill-color:transparent;z-index:2}#editor::selection{background:#c8c2ff80}#highlight{pointer-events:none;color:#26345a}#lines{position:absolute;left:0;top:0;bottom:0;width:48px;margin:0;padding:16px 8px;text-align:right;overflow:hidden;background:#f7f8fc;color:#8390a7;font:12px/23px Menlo,monospace}.keyword{color:#7041bb}.string{color:#167553}.number{color:#a24d17}.comment{color:#79869c}.bottom{height:300px;min-height:200px;border-top:1px solid #e4e8ef;display:flex;flex-direction:column}.bottom-tabs{display:flex;gap:6px;padding:8px;border-bottom:1px solid #e4e8ef;overflow:auto}.panel{flex:1;overflow:auto;margin:0;padding:14px}.panel[hidden]{display:none}iframe.panel{width:100%;border:0;padding:0;background:white}pre.panel{font:12px/20px Menlo,monospace;white-space:pre-wrap;overflow-wrap:anywhere}.file{border:0;text-align:left;border-radius:4px;padding:7px 4px;font-size:12px;min-width:0;flex:1;overflow-wrap:anywhere}.file.active{background:#f2f0ff;color:#5145cd}.tree-row{display:flex;gap:3px;align-items:center}.tree-row>button:last-child{border:0;padding:3px;min-width:28px}#tree{margin:12px 0 24px}.small{font-size:12px;line-height:1.6;color:#60708a}li{line-height:1.65;margin-bottom:10px}ol{padding-left:20px}textarea.prompt{width:100%;min-height:100px;border:1px solid #dce2ed;border-radius:8px;padding:10px;color:#17233b}#ai-reply{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.65;font-size:13px;margin-top:16px}#apply{margin-top:12px;width:100%}.status{padding:8px 16px;border-top:1px solid #e4e8ef;display:flex;justify-content:space-between;gap:12px;font-size:12px;min-height:36px;color:#526079}#save-status{overflow-wrap:anywhere}#terminal-output{font:12px/20px Menlo,monospace;white-space:pre-wrap;max-height:145px;overflow:auto;margin:0 0 8px}#command{width:100%;border:1px solid #dce2ed;padding:10px;border-radius:5px}#checks p{padding:8px;margin:0}.pass{color:#12734e}.fail{color:#a23c2e}.mobile-nav{display:none;padding:8px;gap:6px;border-bottom:1px solid #e4e8ef}dialog{border:1px solid #dce2ed;border-radius:14px;padding:24px;max-width:90vw;width:440px}dialog::backdrop{background:#17233b66}#path-input{width:100%;padding:12px;margin:14px 0;border:1px solid #cbd5e1;border-radius:6px}#dialog-error{color:#a23c2e}#file-actions{padding:12px;background:#f2f0ff;border-radius:8px;margin-top:8px}#managed-path{overflow-wrap:anywhere}.assistant form{display:grid;gap:10px}details{margin-top:14px}summary{cursor:pointer;font-weight:600;padding:10px 0}#reference{white-space:pre-wrap;font-size:13px;color:#526079}
@media(max-width:1050px){.layout{grid-template-columns:220px minmax(280px,1fr)}.assistant{display:none}.mobile-nav{display:flex}body[data-mobile=assistant] .layout{display:block}body[data-mobile=assistant] .explorer,body[data-mobile=assistant] .center{display:none}body[data-mobile=assistant] .assistant{display:block;min-height:80vh}}
@media(max-width:700px){header{padding:10px}.layout{display:block;height:auto;min-height:calc(100vh - 180px)}.explorer,.assistant{display:none}.center{height:calc(100vh - 190px);min-height:640px}.editor-wrap{min-height:330px}.bottom{height:260px}.mobile-nav{display:flex}body[data-mobile=files] .center{display:none}body[data-mobile=files] .explorer{display:block;min-height:80vh}body[data-mobile=assistant] .center{display:none}header .actions{gap:5px}header button{padding:8px 10px;font-size:12px}}
</style></head><body data-mobile="editor"><header><div><h1 id="project-title"></h1><div class="small">Your code · Your account · Your progress</div></div><div class="actions"><button id="run" class="primary">▶ Run</button><button id="stop">Stop</button><button id="save" data-request>Save</button><button id="check" data-request>Check</button><button id="submit" class="primary" data-request>Submit Practice</button><button id="reset">Reset</button><button id="export">Export</button></div></header><nav class="mobile-nav" aria-label="Workspace panels"><button data-mobile="files">Explorer & task</button><button data-mobile="editor" class="selected">Editor</button><button data-mobile="assistant">AI Assistant</button></nav><div class="layout"><aside class="explorer"><h2>EXPLORER</h2><div class="actions"><button id="new-file">+ File</button><button id="new-folder">+ Folder</button></div><div id="tree"></div><div id="file-actions" hidden><p id="managed-path"></p><div class="actions"><button id="rename-path">Rename</button><button id="delete-path">Delete</button><button id="close-actions">Close</button></div></div><h2>YOUR ASSIGNMENT</h2><p id="task-problem"></p><ol id="requirements"></ol><details><summary>Reference guide</summary><p id="reference"></p></details><p class="small" id="runtime-note"></p></aside><main class="center"><nav class="tabs" id="tabs" aria-label="Open files"></nav><div class="editor-wrap"><pre id="lines" aria-hidden="true"></pre><pre id="highlight" aria-hidden="true"></pre><textarea id="editor" aria-label="Source code editor" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off"></textarea></div><section class="bottom"><nav class="bottom-tabs" aria-label="Output panels"><button data-tab="preview" class="selected">Preview</button><button data-tab="console">Console</button><button data-tab="terminal">Terminal</button><button data-tab="checks">Checks</button></nav><iframe class="panel" id="preview" data-panel="preview" title="Isolated project preview" sandbox="allow-scripts" referrerpolicy="no-referrer" srcdoc="<p style='font:14px system-ui;padding:16px;color:#526079'>Write your code, then select Run to preview it.</p>"></iframe><pre class="panel" id="console" data-panel="console" hidden></pre><div class="panel" data-panel="terminal" hidden><pre id="terminal-output"></pre><form id="terminal-form"><input id="command" aria-label="Project terminal command" placeholder="Type help for commands" autocomplete="off" autocapitalize="off"></form></div><div class="panel" id="checks" data-panel="checks" hidden><p>Run Check to inspect your current source against the assignment requirements.</p></div></section></main><aside class="assistant"><h2>AI CODING ASSISTANT</h2><p class="small">Ask for an explanation, a hint, or help debugging. Your current file and assignment are included. Review any suggested code before applying it.</p><form id="ask-form"><label for="ai-model">AI model</label><select id="ai-model" aria-label="AI model"></select><textarea class="prompt" id="prompt" aria-label="Ask the AI assistant" placeholder="Why is my layout overflowing?"></textarea><button class="primary" id="ask">Ask assistant</button></form><div id="ai-reply" aria-live="polite"></div><button id="apply" hidden>Review complete — apply code</button></aside></div><footer class="status"><span id="save-status">Loaded from your account</span><span id="language"></span></footer><dialog id="dialog"><h2 id="dialog-title"></h2><input id="path-input" aria-label="Relative project path" autocomplete="off" autocapitalize="off"><p id="dialog-error" role="alert"></p><div class="actions"><button id="dialog-cancel">Cancel</button><button class="primary" id="dialog-confirm">Save</button></div></dialog><script>(${boot.toString()})(${serialized});</script></body></html>`;
}
