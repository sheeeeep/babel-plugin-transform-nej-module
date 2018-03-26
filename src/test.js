define(['text!./questionItem.html',
       '{pro}/ui/baseui/base.js',
       '{pro}ui/question/type/choice/choice',
       'pro/ui/question/type/subject/subject'],
       function(template,
                BaseUI){
              
             var QuestionItem = BaseUI.extend({
                 name:'questionUI',
                 template:template,
                 config:function(){
                    this.supr();
                    this.root = this.$parent&&this.$parent.name === 'compositUI' ? this.$parent.root : this;
                 },
                 init: function(){
                     this.supr();
                 },
                 onevent: function(type,$event){
                    this.$emit(type,$event);
                 },
                 setDown:function(down){
                    this.$refs.item.setDown(down);
                 }
             }); 
             
             return QuestionItem;    
});
