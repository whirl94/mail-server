package com.iclp.mailserver;

import com.iclp.mailserver.utils.Constants;

import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Runner {
    private static ArrayList<ClientManager> clients = new ArrayList<>();
    private static ExecutorService clientThreadPool = Executors.newFixedThreadPool(Constants.SERVER_THREAD_NR);

    public static void main( String[] args){
        try{
            ServerSocket serverSocket = new ServerSocket(Constants.PORT);

            while(true){
                System.out.println("listening on port " + serverSocket.getLocalPort() + " ...");
                Socket socket = serverSocket.accept();
                System.out.println("a client has connected!");

                ClientManager client = new ClientManager(socket);
                clients.add(client);

                clientThreadPool.execute(client);
            }
        }catch(Exception e) {
            System.out.println("something went wrong");
            e.printStackTrace();
        }
    }
}
