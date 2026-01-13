"use strict";(self.webpackChunkblog=self.webpackChunkblog||[]).push([["7846"],{3646:function(e,t,a){function i(e,t){e.accDescr&&t.setAccDescription?.(e.accDescr),e.accTitle&&t.setAccTitle?.(e.accTitle),e.title&&t.setDiagramTitle?.(e.title)}a.d(t,{A:()=>i}),(0,a(2626).eW)(i,"populateCommonDb")},3337:function(e,t,a){a.d(t,{diagram:()=>C});var i=a(8322),l=a(3646),r=a(722),s=a(583),n=a(2626),o=a(7250),c=a(8940),p=s.vZ.pie,d={sections:new Map,showData:!1,config:p},u=d.sections,g=d.showData,f=structuredClone(p),h=(0,n.eW)(()=>structuredClone(f),"getConfig"),x=(0,n.eW)(()=>{u=new Map,g=d.showData,(0,s.ZH)()},"clear"),m=(0,n.eW)(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);u.has(e)||(u.set(e,t),n.cM.debug(`added new section: ${e}, with value: ${t}`))},"addSection"),w=(0,n.eW)(()=>u,"getSections"),$=(0,n.eW)(e=>{g=e},"setShowData"),S=(0,n.eW)(()=>g,"getShowData"),T={getConfig:h,clear:x,setDiagramTitle:s.g2,getDiagramTitle:s.Kr,setAccTitle:s.GN,getAccTitle:s.eu,setAccDescription:s.U$,getAccDescription:s.Mx,addSection:m,getSections:w,setShowData:$,getShowData:S},v=(0,n.eW)((e,t)=>{(0,l.A)(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},"populateDb"),b={parse:(0,n.eW)(async e=>{let t=await (0,o.Qc)("pie",e);n.cM.debug(t),v(t,T)},"parse")},y=(0,n.eW)(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,"getStyles"),D=(0,n.eW)(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),a=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1).sort((e,t)=>t.value-e.value);return(0,c.ve8)().value(e=>e.value)(a)},"createPieArcs"),C={parser:b,db:T,renderer:{draw:(0,n.eW)((e,t,a,l)=>{n.cM.debug("rendering pie chart\n"+e);let o=l.db,p=(0,s.nV)(),d=(0,r.Rb)(o.getConfig(),p.pie),u=(0,i.P)(t),g=u.append("g");g.attr("transform","translate(225,225)");let{themeVariables:f}=p,[h]=(0,r.VG)(f.pieOuterStrokeWidth);h??=2;let x=d.textPosition,m=(0,c.Nb1)().innerRadius(0).outerRadius(185),w=(0,c.Nb1)().innerRadius(185*x).outerRadius(185*x);g.append("circle").attr("cx",0).attr("cy",0).attr("r",185+h/2).attr("class","pieOuterCircle");let $=o.getSections(),S=D($),T=[f.pie1,f.pie2,f.pie3,f.pie4,f.pie5,f.pie6,f.pie7,f.pie8,f.pie9,f.pie10,f.pie11,f.pie12],v=0;$.forEach(e=>{v+=e});let b=S.filter(e=>"0"!==(e.data.value/v*100).toFixed(0)),y=(0,c.PKp)(T);g.selectAll("mySlices").data(b).enter().append("path").attr("d",m).attr("fill",e=>y(e.data.label)).attr("class","pieCircle"),g.selectAll("mySlices").data(b).enter().append("text").text(e=>(e.data.value/v*100).toFixed(0)+"%").attr("transform",e=>"translate("+w.centroid(e)+")").style("text-anchor","middle").attr("class","slice"),g.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-200).attr("class","pieTitleText");let C=[...$.entries()].map(([e,t])=>({label:e,value:t})),W=g.selectAll(".legend").data(C).enter().append("g").attr("class","legend").attr("transform",(e,t)=>"translate(216,"+(22*t-22*C.length/2)+")");W.append("rect").attr("width",18).attr("height",18).style("fill",e=>y(e.label)).style("stroke",e=>y(e.label)),W.append("text").attr("x",22).attr("y",14).text(e=>o.getShowData()?`${e.label} [${e.value}]`:e.label);let k=512+Math.max(...W.selectAll("text").nodes().map(e=>e?.getBoundingClientRect().width??0));u.attr("viewBox",`0 0 ${k} 450`),(0,s.v2)(u,450,k,d.useMaxWidth)},"draw")},styles:y}}}]);