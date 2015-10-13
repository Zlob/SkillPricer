require( [         
    "skill-compass/views/area",
    "skill-compass/views/selection",
    "skill-compass/views/statistic",  
    "skill-compass/views/jobs-table",  
    "skill-compass/views/navigation",
    "skill-compass/views/error",
    "skill-compass/collections/groups",
    "skill-compass/collections/skills",
    
    "bootstrap"
         ], function( AreaView, SelectionView, StatisticView, JobsTableView, NavigationView, ErrorView, Groups, Skills ) {   
    
    var areaView = new AreaView();    
    
    var Router = Backbone.Router.extend({
        
        initialize: function(options) {
            this.navigation = new NavigationView();
            this.groups = new Groups();

            this.skills = new Skills();

            this.promisArr = [
                this.groups.fetch(),
                this.skills.fetch()
            ];   
            
            var self = this;
            $.when.apply($, this.promisArr).then( function() {                
                var storedSelection = new Backbone.Collection(JSON.parse(localStorage.getItem('selection'))); 
                self.skills.each(function(skill) {
                    var storedSkill = storedSelection.get(skill.get('id'));
                    if( storedSkill ) {
                        skill.set('checked', storedSkill.get('checked'));    
                    }
                    else{
                        skill.set('checked', false);    
                    }
                    
                    skill.on('change', self.saveSelection, self);
                })
                Backbone.history.start()
            }); 
        },
        
        saveSelection: function (){
            localStorage.setItem('selection',  JSON.stringify(this.skills));
        },
        
        routes: {
            "*any"             : "_commutator"
        },
        
        _routes: {
            ""          : "selection",
            "selection" : "selection",  
            "jobs"      : "jobs",
            "charts"    : "charts"
        },

        _commutator : function() {
            var route = Backbone.history.getFragment();
            var routFunction = this._routes[ route ] ;
            this.navigation.setActiveTab( routFunction );
            var self = this;
            
            $('#step-content').fadeOut('slow',function(){
                self[routFunction]( function() {
                    $('#step-content').fadeIn('slow');
                } );
            })
        },


        selection: function(callback) {
            var selectionView = new SelectionView( {groups : this.groups, skills : this.skills} );
            $('#step-content').empty().append( selectionView.render().$el );   
            callback();
        },
        
        charts : function(callback) {
            if(this._checkSkillsSelected()){
                var statistic = new StatisticView({skills : this.skills});
                $('#step-content').empty().append( statistic.render().$el );  
                statistic.show();  
                callback();
            }
            else{
                this.error(callback);
            }

        },
        
        jobs : function(callback) {
            if(this._checkSkillsSelected()){
                var jobsTable = new JobsTableView({skills : this.skills});
                $('#step-content').empty().append( jobsTable.render().$el );
                callback();
            }
            else{
                this.error(callback);
            }  

        },
        
        error  : function(callback){
            var error = new ErrorView();
            $('#step-content').empty().append( error.render().$el );  
            callback();
        },
        
        _checkSkillsSelected : function(){
            return this.skills.some(function(model){
                return model.get('checked') === true;
            });
        }
        
        
         
    });
    
    var router = new Router();     

});