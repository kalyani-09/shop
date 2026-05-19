package org.example;


import io.temporal.client.WorkflowClient;
import io.temporal.serviceclient.WorkflowServiceStubs;
import io.temporal.serviceclient.WorkflowServiceStubsOptions;
import io.temporal.worker.Worker;
import io.temporal.worker.WorkerFactory;
import org.example.activity.OrderActivityImpl;
import org.example.activity.StockActivityImpl;
import org.example.workflow.OrderFulfilmentWorkflowImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;

@SpringBootApplication
public class TemporalWorkerApplication {
     public static void main(String[] args){
         SpringApplication.run(TemporalWorkerApplication.class, args);
     }

     @Autowired
    private StockActivityImpl stockActivity;

     @Autowired
    private OrderActivityImpl orderActivity;

     @Value("${temporal.service.target:localhost:7233}")
     private String temporalTarget;

     @Bean
    public WorkflowServiceStubs workflowServiceStubs(){
        return WorkflowServiceStubs.newServiceStubs(
            WorkflowServiceStubsOptions.newBuilder()
                .setTarget(temporalTarget)
                .build()
        );
    }

     @Bean
    public WorkflowClient workflowClient(WorkflowServiceStubs workflowServiceStubs){
         return WorkflowClient.newInstance(workflowServiceStubs);
     }

     @Bean
    public WorkerFactory workerFactory(WorkflowClient workflowClient){
         return WorkerFactory.newInstance(workflowClient);
     }

     @Bean
    public Worker orderWorker(WorkerFactory workerFactory, WorkflowClient workflowClient){
         Worker worker = workerFactory.newWorker("ORDER_TASK_QUEUE");

         worker.registerWorkflowImplementationTypes(OrderFulfilmentWorkflowImpl.class);
         worker.registerActivitiesImplementations(stockActivity, orderActivity);

         return worker;
     }

     @Bean
     public CommandLineRunner startWorkers(WorkerFactory workerFactory){
         return args -> workerFactory.start();
     }
}
