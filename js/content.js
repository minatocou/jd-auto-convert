$(function(){
    var now=new Date();
    var cvJson;
    var port = chrome.runtime.connect({name: "con"});
    var pageBtn=$('<input type="button" class="page-btn" value="保存到Copetus" / >').appendTo('body')
    pageBtn.on('click',function(){
        //chrome.tabs.create( { url:chrome.extension.getURL('./jd.html'), index:(S.tab.index+1), selected:false }, function(tab){
        //    setTimeout(function(){_send2Spliter(tab); },50 );
        //});
        port.postMessage({action: "getToken"});
        //var port = chrome.runtime.connect({action: "hello"});
        //port.onMessage.addListener(function(msg) {
        //    console.log(msg);
        //});
    })
    port.onMessage.addListener(function(response) {
        if(response.reaction=='saveCv'){
            if(response.status=='success'){
                alert('保存成功');
            }else{
                alert('保存失败')
            }

        }
        if(response.reaction=='getToken'){
            if(!response.userTonken){
                alert('请登录');
            }else{
                chrome.runtime.sendMessage({action: "getCv"}, function(response) {
                    var base=$('.resume-basic');
                    var bInfo=$('.resume-basic-info');
                    var year=new Date().getFullYear();
                    var jd = {
                        code: $('.tab li:eq(0)').hasClass('active')?'中文简历':'英文简历',
                        refurl:location.href,
                        refid:$('[data-nick=res_id]').text(),
                        lastlogin: $('.resume-sub-info').text().match('最后登录：.*')[0].replace('最后登录：',''),
                        status:base.find('p.text-center').text(),//在职情况
                        //基本资料
                        baseinfo:{
                            name: findTable(bInfo,0,0),//姓名
                            gender:findTable(bInfo,0,1),//性别
                            celphone:$('.telphone').length>0?'<img src='+$('.telphone').attr('src')+' />':findTable(bInfo,1,0),//联系电话
                            birthyear:year-findTable(bInfo,1,1), //年龄
                            email:$('.email').length>0? '<img src='+$('.email').attr('src')+' />':findTable(bInfo,2,0),//邮箱
                            degree:findTable(bInfo,2,1), //学历
                            weixin:null,
                            wedlock:findTable(bInfo,3,1), //婚姻
                            startwork:findTable(bInfo,4,0), //工作年限
                            city:findTable(bInfo,4,1), //所在城市
                            provice:findTable(bInfo,4,1),//市区
                            avatar:base.find('.face img').attr('src'),//头像
                            nationality:null,//国籍
                            hukou:null,//户口
                            considerVenture:null//考虑初创
                        },
                        current:{
                            //职位概况
                            currentfunction:findText('所在行业：','td'),//所在行业
                            currentcompeny: findText('公司名称：','td'),//公司名称
                            currentposition: findText('所任职位：','td'),//职位名称
                            currentsalary: findText('目前薪资：','td')//目前薪资
                        },
                        career:{
                            //职业发展意向
                            expectindustry: findText('期望行业：','td'),//期望行业
                            expectfunction: findText('期望职位：','td'),//期望职位
                            expectcity: findText('期望地点：','td'),//期望地点
                            expectsalary: findText('期望月薪：','td'),//期望月薪
                            norec:findText('勿推荐企业：','td')//勿推荐企业
                        },

                        workexperience:searchJob(), //工作经验
                        workexperienceText:$('#workexp_anchor tr:eq(0) td:eq(0)').html(),
                        projectexperience:searchProduct(),//项目经验
                        educationbackground:searchEdu(), //教育经历

                        language:searchLanguage(),
                        selfintrduction:$('.resume-comments tr:eq(0) td:eq(0)').text(),
                        attrachment:$('.resume-others tr:eq(0) td:eq(0)').text()

                    }
                    var out=JSON.stringify(jd);
                    //chrome.runtime.connect().postMessage(out);

                    template.config('escape',false);
                    template.helper('toStr',function(str){
                        return $('<div/>').html(str).text();
                    });
                    template.helper('isArray',function(str){
                        console.log($.isArray(str));
                        return $.isArray(str);
                    });
                    var render=template.compile(response.html);
                    var html = render(jd);
                    var autoJd=$('#autoJd').length>0?$('#autoJd'):$('<div id="autoJd" />').appendTo('body');
                    autoJd.html(html);

                    autoJd.on('click','#saveBtn',function(){

                        port.postMessage({action: "saveCv",cv:out});
                    })
                });
            }
        }
    });
    function findTable(ele,row,col){
        var reg=new RegExp(".*：","g");
        var val=$.trim(ele.find('tr:eq('+row+') td:eq('+col+')').text()).replace(reg,'');
        return val;
    }
    function findText(text,dom,notReplace){
        if($.type(dom)=='string'){
            return notReplace? $(dom+":contains("+text+")").text() : $(dom+":contains("+text+")").text().replace(text,'');
        }else{
            var temp=dom.find(":contains("+text+"):last").text();
            return notReplace? temp : temp.replace(text,'')
        }

    }
    function findTdByTh(text,dom,si){
        console.log(dom.find(":contains("+text+"):last").siblings())
        var temp=dom.find(":contains("+text+"):last").siblings().text();
        return temp;
    }
    function searchJob(){
        var jobs=[];
        var job={
            startmonth:null,//工作时间
            startyear:null,
            endmonth:null,
            endyear:null,
            companyname:null,//公司名
            //duration:null,//工作时长
            companyindustry:null,//公司行业
            info:null,//公司描述
            position:null//职位


        };
        var work=$('#workexp_anchor');
        var title=work.find('.resume-job-title');
        var indent=work.find('.resume-indent');
        indent.each(function(i){
            job={};
            var workTime=title.eq(i).find('.work-time').text().split('-');
            job.startmonth=workTime[0].split('.')[1];
            job.startyear=workTime[0].split('.')[0];
            job.endyear=workTime[1].split('.')[0];
            job.endmonth=workTime[1].split('.').length>1?workTime[1].split('.')[1]:'至今';
            job.endyearNum=workTime[1].split('.').length>1?workTime[1].split('.')[0]:now.getFullYear();
            job.comName=title.eq(i).find('.compony').text();
            //job.duration=title.eq(i).find('.compony > span').text();
            job.companyindustry=$(this).find('table:first tr:eq(0) td:eq(0)').text();
            job.info=$(this).find('table:first tr:eq(1) td:eq(0)').text();
            job.position=[];

            $(this).find('.job-list').each(function(i){
                var position={};
                var $this=$(this);
                var time=$this.find('.job-list-title span').text();
                position.startmonth=time.split('-')[0];
                position.endmonth=time.split('-')[1];
                position.jobTitle= $this.find('.job-list-title strong').text();
                var temp=$this.find('.job-list tr:eq(1)').text().split('|');
                for(var i=0;i<temp.length;i++){
                    if(temp[i].match('汇报对象：')){
                        position.report=temp[i].replace('汇报对象：','')
                    }
                    if(temp[i].match('下属人数：')){
                        position.sub=temp[i].replace('下属人数：','')
                    }
                    if(temp[i].match('所在区域：')){
                        position.location=temp[i].replace('所在地区：','')
                    }
                    if(temp[i].match('所在部门：')){
                        position.department=temp[i].replace('所在部门：','')
                    }
                }
                position.responsible= $this.find(":contains('工作职责：'):last").next().text();
                position.performance= $this.find(":contains('工作业绩：'):last").next().text();
                job.position.push(position);
            });
            jobs.push(job);
        });
        return jobs;
    }
    function searchProduct(){
        var ps=[];
        var p={
            projectname:null,//项目名
            projectposition:null,//项目职务
            startmonth:null,
            startyear:null,
            endmonth:null,
            endyear:null,
            company:null,//所在公司
            projectdesc:null,//项目简介
            responsible:null,//项目职责
            performance:null//项目业绩
        }
        var $ps=$('.project-list');
        $ps.each(function(i){
            var $this=$(this);
            p.projectname=$this.find('.project-list-title > strong').text();
            var time=$this.find('.project-list-title > span').text();
            p.startyear=time.split('-')[0].split('.')[0];
            p.startmonth=time.split('-')[0].split('.')[1];
            p.endyear=time.split('-')[1].split('.')[0];
            p.endmonth=time.split('-')[1].split('.').length>1?time.split('-')[1].split('.')[1]:'至今';
            p.projectposition=findText('项目职务：',$this);
            p.company=findTdByTh('所在公司：',$this,'.td');
            p.projectdesc=findTdByTh('项目简介：',$this,'.td');
            p.responsible=findTdByTh('项目职责：',$this,'.td');
            p.performance=findTdByTh('项目业绩：',$this,'.td');
            ps.push(p);
            console.log(p)
        })
        return ps;
    }
    function searchEdu(){
        var es=[];
        var e={
            university:null,
            startmonth:null,
            startyear:null,
            endmonth:null,
            endyear:null,
            major:null,
            degree:null,
            istongzhao:null
        }
        var $es=$('.resume-education>table');
        $es.each(function(i){
            e = {};
            var $that=$(this);
            e.university=$that.find('tr:eq(0) td:eq(0) strong').text();
            var time=$that.find('tr:eq(0) td:eq(0)').text().match('\\（.*')? $that.find('tr:eq(0) td:eq(0)').text().match('\\（.*')[0].replace(/[（）]/g,''):'';
            e.startyear=time.split('-')[0].split('.')[0];
            e.startmonth=time.split('-')[0].split('.')[1];
            e.endyear=time.split('-')[1]?time.split('-')[1].split('.')[0]:'至今';
            e.endmonth=time.split('-')[1]?time.split('-')[1].split('.')[1]:'至今';

            e.specialty=findText('专业：',$that);
            e.education=findText('学历：',$that);
            e.isUnify=findText('是否统招：',$that);
            es.push(e);
        })
        return es;
    }
    function searchLanguage(){
        var l=$('.resume-language tr:eq(0) td:eq(0)').text();
        var language={
            name:null
        }
        return l.split('、')
    }
})

//图片转base64
function convertImgToBase64(url, callback, outputFormat){
    var canvas = document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'),
        img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img,0,0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        canvas = null;
    };
    img.src = url;
}