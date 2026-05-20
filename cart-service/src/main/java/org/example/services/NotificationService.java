package org.example.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter registerAdmin() {
        // Create an emitter with a long timeout (e.g., 30 minutes = 1,800,000 ms)
        SseEmitter emitter = new SseEmitter(1800000L);

        this.emitters.add(emitter);
        logger.info("Registered a new admin SseEmitter. Total emitters: {}", emitters.size());

        emitter.onCompletion(() -> {
            logger.info("SseEmitter completed. Removing from emitters list.");
            this.emitters.remove(emitter);
        });

        emitter.onTimeout(() -> {
            logger.info("SseEmitter timed out. Removing from emitters list.");
            emitter.complete();
            this.emitters.remove(emitter);
        });

        emitter.onError((e) -> {
            logger.info("SseEmitter error occurred. Removing from emitters list.", e);
            emitter.complete();
            this.emitters.remove(emitter);
        });

        // Send an initial handshake event
        try {
            emitter.send(SseEmitter.event()
                    .name("INIT")
                    .data("Connection established"));
        } catch (IOException e) {
            logger.error("Failed to send INIT event to emitter", e);
            emitter.complete();
            this.emitters.remove(emitter);
        }

        return emitter;
    }

    public void sendOrderNotificationToAdmins(String message) {
        logger.info("Sending order notification to {} admins: {}", emitters.size(), message);
        List<SseEmitter> deadEmitters = new ArrayList<>();

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("order-notification")
                        .data(message));
            } catch (Exception e) {
                logger.warn("Failed to send notification. Marking emitter as dead.", e);
                deadEmitters.add(emitter);
            }
        }

        if (!deadEmitters.isEmpty()) {
            logger.info("Removing {} dead emitters.", deadEmitters.size());
            this.emitters.removeAll(deadEmitters);
        }
    }
}
