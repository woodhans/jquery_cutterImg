/*! author Hans.Wu http://www.hanswu.com
 * project: https://github.com/woodhans/jquery_cutterImg
 require jquery 1.6+*/
 (function($,window,document){
    var cutterImg=function(){
		return{
			init:function(options,el){
				var base=this;
				base.$opt=options;
				base.$elem=el;
				base._setup()
            },
            _setup:function(){
                var base=this;
                var accept=base.$opt.accept.split('|').map(function(item){return "image/"+item}).toString(),
                $fileInp='<input type="file"  accept="'+accept+'" class="hw_file_input" />',
                dragCss=base.$opt.dragImg?" hw_drag_img":"",
                $imgArea='<div class="hw_img_wrapper'+dragCss+'" style="width:'+base.$opt.width+';height:'+base.$opt.height+';min-width:'+base.$opt.cutterWidth+';min-height:'+base.$opt.cutterHeight+'"></div>';
                base.$elem.addClass("hw_cutter_img").append($fileInp+$imgArea);
                base._cut();
            },
            _cut:function(){
                var base=this;
                base.$elem.find('.hw_file_input').on('change',function(){
                    var file=$(this)[0].files[0];
                    base._handleFile(file);
                });
                if(base.$opt.dragImg){
                    base.$elem.find('.hw_drag_img').on('click',function(e){
                        if($('.hw_img_wrapper').hasClass('editing')){
                            e.stopPropagation();
                            e.preventDefault();
                        }
                        base.$elem.find('.hw_file_input').click()
                    })
                    document.getElementsByClassName("hw_drag_img")[0].addEventListener("dragover", function(e) { base.funDragHover(e); }, false);
                    document.getElementsByClassName("hw_drag_img")[0].addEventListener("dragleave", function(e) { base.funDragHover(e); }, false);
                    document.getElementsByClassName("hw_drag_img")[0].addEventListener("drop", function(e) { base.funGetFiles(e); }, false);
                }
            },
            _handleFile:function(file){
                var base=this;
                console.log(file);
                if (file.type.indexOf("image") == 0) {
                    if(file.size>base.$opt.limitSize){
                        filesize=(base.$opt.limitSize)/1024>1024?(base.$opt.limitSize)/(1024*1024)+"m":(base.$opt.limitSize)/1024>1?(base.$opt.limitSize)/1024+"k":base.$opt.limitSize;
                        alert("文件["+file.name+"]太大，请控制在"+filesize+"b以内");
                    }else{
                        var reader=new FileReader();
                        if(!$('.hw_img_wrapper').hasClass('editing')){
                            var canmove=base.$opt.canMove?'canmove':'',
                            $cutterResize=base.$opt.resizable?'<div class="resize_img" style="width:'+(parseInt(base.$opt.cutterWidth)+20)+'px;height:'+(parseInt(base.$opt.cutterHeight)+20)+'px;"><span class="ne"></span><span class="se"></span><span class="nw"></span><span class="sw"></span></div>':'',
                            $imgResize=base.$opt.imgResizable?'<div class="resize_img"><span class="ne"></span><span class="se"></span><span class="nw"></span><span class="sw"></span></div>':'',
                            $img='<div class="hw_img" style="width:'+base.$opt.width+';height:'+base.$opt.height+';"><img id="hw_thumb" style="max-width:'+(parseInt(base.$opt.width)-20)+'px;max-height:'+(parseInt(base.$opt.height)-20)+'px;" class="'+canmove+'"/>'+$imgResize+'<div class="delete_img">X</div></div>',
                            $cutter='<div class="hw_cutter_wrapper" style="width:'+base.$opt.maxWidth+';height:'+base.$opt.maxHeight+'"><div class="hw_cutter canmove" style="width:'+base.$opt.cutterWidth+';height:'+base.$opt.cutterHeight+'"></div>'+$cutterResize+'</div>',
                            $button='<input type="button" value="裁切" class="hw_submit" />';
                            $('.hw_img_wrapper').append($img+$cutter).addClass('editing');
                            base.$elem.append($button);
                            
                        }
                        // var $img='<img style="max-width:'+base.$opt.width+';max-height:'+base.$opt.height+'"/>',
                        // $cutter='<div class="hw_cutter" style="width:'+base.$opt.cutterWidth+';height:'+base.$opt.cutterHeight+'"></div>';
                        // ;
                        reader.onload= function (e) {
                            $('#hw_thumb').attr('src',e.target.result);
                            
                            base._dragElem($('.hw_cutter'),$('#hw_thumb'),$('.hw_cutter_wrapper .resize_img'));
                            base._deleteImg();
                            if(base.$opt.canMove)   base._dragElem($('#hw_thumb'),$('.hw_img'),$('.hw_img .resize_img'));
                            if(base.$opt.resizable)   base._resizeDom($('.hw_cutter'),$('.hw_cutter_wrapper'));
                            if(base.$opt.imgResizable)   base._resizeDom($('#hw_thumb'));
                            base.$elem.find(".hw_submit").on('click',function(){
                                base._cutThis();
                            })
                        };
                        reader.readAsDataURL(file);
                    }
                }else{
                    alert('文件"' + file.name + '"不是图片。');
                }
                
            },
            _deleteImg:function(){
                // var base=this;
                $('.delete_img').on('click',function(e){
                    $('.hw_img_wrapper').removeClass('editing').html('');
                    $('.hw_submit').remove();
                })
            },
            _resizeDom:function($el,$el2){},
            _dragElem:function($el,$el2,$el3){
                // var base=this;
                var originX,originY,
                mouseX,mouseY,maxX,maxY,
                newMouseX,newMouseY,
                distanceX,newMouseY;
                $('.canmove').on('mousedown',function(e){
                    $this=$(this);
                    $this.addClass('dragging');
                    originX=parseInt($el.css('left'));
                    originY=parseInt($el.css('top'));
                    mouseX=e.pageX;
                    mouseY=e.pageY;
                    window.onmousemove=function(e){
                        if($this.hasClass('dragging')){
                            newMouseX=e.pageX;
                            newMouseY=e.pageY;
                            distanceX=newMouseX-mouseX;
                            distanceY=newMouseY-mouseY;
                            maxX=$el2.width()-$el.width();
                            maxY=$el2.height()-$el.height();
                            if(originX+distanceX>maxX){
                                $el.css('left',maxX);
                                if($el3)
                                $el3.css('left',maxX);
                            }else if(originX+distanceX<=0){
                                $el.css('left',0);
                                if($el3)
                                $el3.css('left',0);
                            }else{
                                $el.css('left',originX+distanceX);
                                if($el3)
                                $el3.css('left',originX+distanceX);
                            }
                            if(originY+distanceY>maxY){
                                $el.css('top',maxY);
                                if($el3)
                                $el3.css('top',maxY);
                            }else if(originY+distanceY<=0){
                                $el.css('top',0);
                                if($el3)
                                $el3.css('top',0);
                            }else{
                                $el.css('top',originY+distanceY);
                                if($el3)
                                $el3.css('top',originY+distanceY);
                            }
                        }
                    }
                }).on('mouseup',function(e){
                    $(this).removeClass('dragging');
                    // window.onmousemove=null;
                    return
                })
            },
            _cutThis:function(){
                var base=this;
                var newX=$('.hw_cutter').position().left,
                newY=$('.hw_cutter').position().top,
                cutterWidth=$('.hw_cutter').width(),
                cutterHeight=$('.hw_cutter').height();
                var img=document.getElementById('hw_thumb'),
                hw_wrapper=document.getElementsByClassName('hw_img_wrapper')[0],
                can=document.createElement("canvas");
                hw_wrapper.appendChild(can);
                getImageSize($('#hw_thumb').attr('src'),function(w,h){
                    xScale=w/($('#hw_thumb').width());
                    yScale=h/($('#hw_thumb').height());
                })
                can.setAttribute('width',cutterWidth);
                can.setAttribute('height',cutterHeight);
                can.setAttribute('style','margin-left:-'+cutterWidth/2+'px;margin-top:-'+cutterHeight/2+'px');
                ctx=can.getContext("2d");                
                ctx.drawImage(img,newX*xScale,newY*yScale,cutterWidth*xScale,cutterHeight*yScale,0,0,cutterWidth,cutterHeight);
                var reEditButton='<input type="button" value="重新裁切" class="hw_edit" />',
                uploadButton='<input type="button" value="上传" class="hw_upload" />';
                $('.hw_img_wrapper').addClass('cutting');
                $('.hw_file_input,.hw_submit').attr('disabled',true);
                base.$elem.append(reEditButton+uploadButton);
                base._reEdit();
                base._upload();
            },
            _reEdit:function(){
                $('.hw_edit').on('click',function(){
                    $('.hw_img_wrapper').removeClass('cutting').find('canvas').remove();
                    $('.hw_submit').attr('disabled',false);
                    $('.hw_edit,.hw_upload').remove()
                })
            },
            _upload:function(){
                var base=this;
                can=document.getElementsByTagName('canvas')[0];
                $('.hw_upload').on('click',function(){
                    
                    var data=can.toDataURL();
                    data=data.split(',')[1];
                    data=window.atob(data);
                    var ia = new Uint8Array(data.length);
                    for (var i = 0; i < data.length; i++) {
                        ia[i] = data.charCodeAt(i);
                    }
                    var blob=new Blob([ia],{type:"image/png",endings:'transparent'});
                    var fd=new FormData();
                    fd.append('avatarFile',blob,'image.png');
                    
                    if(!$.isEmptyObject(base.$opt.data)){
                        jsonD=base.$opt.data;
                        for (item in jsonD){
                            fd.append(item,jsonD[item]);
                        }
                    }
                    
                    // $.ajax({
                    //     url:base.$opt.url,
                    //     data:fd,
                    //     type:base.$opt.type,//只能post
                    //     processData : false,//只能false
                    //     contentType : false,//只能false
                    //     success:base.$opt.onSuccess
                    //     error:base.$opt.onError
                    // })
                    var httprequest=new XMLHttpRequest();
                    httprequest.open('POST',base.$opt.url,true);
                    httprequest.send(fd);
                    httprequest.onreadystatechange= function () {
                        if(httprequest.status==200 && httprequest.readyState==4){
                            if(typeof(base.$opt.onSuccess)=="function")
                                base.$opt.onSuccess(httprequest.responseText);
                            //$('#returnImg').attr('src','/images/'+JSON.parse(httprequest.responseText).json);
                        }else{
                            if(typeof(base.$opt.onError)=="function")
                                base.$opt.onError(httprequest.responseText);
                        }
                    };
                })
            },
            funGetFiles:function(e){
                this.funDragHover(e);
                var files = e.target.files || e.dataTransfer.files;
                this._handleFile(files[0]);
            },
            funDragHover:function(e){
                e.stopPropagation();
                e.preventDefault();
                this[e.type === "dragover"? "onDragOver": "onDragLeave"].call(e.target);
                return this;
            },
            onDragOver:function(){
                console.log('aaa');
            },
            onDragLeave:function(){
                console.log('bbb');
            },
            
        }
    }
    $.fn.cutterImg=function(options){
        options=$.extend({},$.fn.cutterImg.options,this.data(),options);
        if(options.url=='') options.url=this.attr('action');
        if(typeof(options.width)=="number" &&options.width>0) options.width=options.width+"px";
        if(typeof(options.height)=="number" &&options.height>0) options.height=options.height+"px";
        if(typeof(options.maxWidth)=="number" &&options.maxWidth>0) options.maxWidth=options.maxWidth+"px";
        if(typeof(options.maxHeight)=="number" &&options.maxHeight>0) options.maxHeight=options.maxHeight+"px";
        options.cutterWidth=(typeof(options.cutterWidth)=="number" &&options.cutterWidth>0)? options.cutterWidth+"px":"32px";
        options.cutterHeight=(typeof(options.cutterHeight)=="number" &&options.cutterHeight>0)? options.cutterHeight+"px":"32px";
        if(typeof(options.limitSize)=="string") options.limitSize=options.limitSize.toLowerCase().indexOf('k')>0?parseInt(options.limitSize)*1024:options.limitSize.toLowerCase().indexOf('m')>0?parseInt(options.limitSize)*1024*1024:500*1024;
        var ci=new cutterImg();
		ci.init(options,this);
    };
    $.fn.cutterImg.options={
        accept:"jpeg|png|gif",
        width:"auto",
        height:"auto",
        maxWidth:"100%",
        maxHeight:"100%",
        cutterWidth:32,
        cutterHeight:32,
        limitSize:500*1024,
        canMove:!1,
        imgResizable:!1,
        resizable:!1,
        // multiple:!1,
        url:'',
        data:{},
        type:"post",        //只能post方式
        onSuccess:null,
        onError:null,
        dragImg:!1          //拖放外部图片
    };
    function getImageSize(url,callback){
        var img = new Image();
        img.src = url;
        // 如果图片被缓存，则直接返回缓存数据
        if(img.complete){
            callback(img.width, img.height);
        }else{
            // 完全加载完毕的事件
            img.onload = function(){
            callback(img.width, img.height);
            }
            }
    }
}(jQuery,window,document));