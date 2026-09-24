package com.andara.erp.repository;

import com.andara.erp.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByReferenceTypeAndReferenceIdOrderByCreatedAtDesc(String referenceType, Long referenceId);

    void deleteByReferenceTypeAndReferenceId(String referenceType, Long referenceId);
}
