package com.example.dossiers_service;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "attachment-service", url = "http://localhost:8083/api/attachments")
public interface AttachmentServiceClient {

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    String uploadFile(@RequestPart("file") MultipartFile file, @RequestParam("serviceName") String serviceName, @RequestParam("entityId") Long entityId);

    @DeleteMapping("/delete")
    void deleteFile(@RequestParam("fileId") String fileId);
}
