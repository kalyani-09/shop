package org.example.dto;


import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductBrief {

    private Long id;
    private String name;
    private Double price;

    @JsonProperty("imageURL")
    @JsonAlias({"imageURL", "imageUrl"})
    private String imageURL;
}
