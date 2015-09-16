define([
    "backbone",    
    "Chart",
    "text!../templates/related-chart.html"
], function( Backbone, Chart, tpl ) {

    var view = Backbone.View.extend({
        // Кэшируем html-шаблон
        template : _.template( tpl ),       

        initialize : function( options ) {
            this.dispetcher = Backbone.Events;
            this.dispetcher.on('area-change', this.showChart, this);
//             this.skills = options.skills;
        },

        render : function() {      
            this.$el.empty().append( this.template() );           
            return this;
        },
        
        showChart : function () {
            var self = this;
            
            $.ajax({
                method: "POST",
                url: "api/related-chart-info",
                data: { 
                    id: self.model.get('id'),
                    areaId: localStorage.getItem('areaId') || 1
                },
                headers: {
                "X-CSRF-TOKEN": $("meta[name='csrf-token']").attr("content")
                }
            }).done(function(rawData) {
                var data = self.prepareData(rawData);
                var ctx = self.$("#related-chart").get(0).getContext('2d');
                self.myNewChart = new Chart(ctx).Bar(
                    data,
                    {
                        tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>%",
                        scaleLabel: "<%=value%>%",
                        scaleOverride: true,
                        scaleSteps: 10,
                        scaleStepWidth: 10,
                        scaleStartValue: 0,
                    }
                );
            });          
        },
        
        prepareData : function(rawData) {
            var data = {
                labels: [],
                datasets: [
                    {
                        label: "График часто встречающихся навыков",
                        fillColor: "rgba(209,89,38,0.5)",
                        strokeColor: "rgba(209,89,38,0.8)",
                        highlightFill: "rgba(209,89,38,0.75)",
                        highlightStroke: "rgba(209,89,38,1)",
                        data: []
                    }
                ]
            };
            _.each(rawData, function(column) {
                data.labels.push(column.name);
                data.datasets[0].data.push(parseInt(column.total_count));
            })
            return data;
        }
       
    });
    
    

    return view;
});