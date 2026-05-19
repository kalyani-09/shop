package org.example.exception;

public class ReelNotFoundException extends RuntimeException{
    public ReelNotFoundException(Long id){
        super("Reel not found with id: " + id);
    }
}
