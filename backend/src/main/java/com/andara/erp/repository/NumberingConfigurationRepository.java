package com.andara.erp.repository;

import com.andara.erp.entity.DocumentType;
import com.andara.erp.entity.NumberingConfiguration;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NumberingConfigurationRepository extends JpaRepository<NumberingConfiguration, Long> {

    Optional<NumberingConfiguration> findByDocumentType(DocumentType documentType);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT n FROM NumberingConfiguration n WHERE n.documentType = :documentType")
    Optional<NumberingConfiguration> findByDocumentTypeWithLock(@Param("documentType") DocumentType documentType);
}
