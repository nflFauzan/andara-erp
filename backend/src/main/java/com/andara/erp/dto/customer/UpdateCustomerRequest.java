package com.andara.erp.dto.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateCustomerRequest {

    @NotBlank(message = "Kode customer wajib diisi")
    @Size(max = 50, message = "Kode customer maksimal 50 karakter")
    private String code;

    @NotBlank(message = "Nama customer wajib diisi")
    @Size(max = 150, message = "Nama customer maksimal 150 karakter")
    private String name;

    @Size(max = 150, message = "Nama instansi/perusahaan maksimal 150 karakter")
    private String companyName;

    private String address;

    @Size(max = 50, message = "Nomor telepon maksimal 50 karakter")
    private String phone;

    @Email(message = "Format email tidak valid")
    @Size(max = 100, message = "Email maksimal 100 karakter")
    private String email;

    @Size(max = 100, message = "Nama PIC maksimal 100 karakter")
    private String picName;

    private String notes;

    private Boolean active;

    public UpdateCustomerRequest() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPicName() {
        return picName;
    }

    public void setPicName(String picName) {
        this.picName = picName;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
