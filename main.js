class Loader {
    static startLoading(){
        document.querySelector(".loader").style.display = "flex";
    }
    static endLoading(){
        document.querySelector(".loader").style.display = "none";
    }
}


class FilterProductDto
{
        StartedIndex=0;
        ProductCount=1000000000;
        CategoryIds;

        constructor(){
            this.CategoryIds = [];
        }
}


class ApiWorker{
    productApiUrl;
    ProductCategoryApiUrl;
    filterApiUrl;

    constructor(){
        this.productApiUrl = 'https://europroductcms.azurewebsites.net/api/fetchProducysStepByStep/0/50';
        this.ProductCategoryApiUrl = 'https://europroductcms.azurewebsites.net/api/productcategory';
        this.filterApiUrl = "https://europroductcms.azurewebsites.net/api/FetchFilteredProductsStepByStep"
    }

    readAllProductCategory(renderDataLogic){
        var http = new XMLHttpRequest();
        http.open("GET",this.ProductCategoryApiUrl);
        http.onloadend = function (){
            var data = JSON.parse(http.response);
            console.log(data);
            renderDataLogic(data)
        }
        http.send();
    }

    getAllProducts(renderDataLogic){
        var http = new XMLHttpRequest();
        http.open("GET",this.productApiUrl);
        http.onloadstart = function(){
            Loader.startLoading();
        }
        http.onloadend = function(){
            var data = JSON.parse(http.response)
            console.log(data);
            renderDataLogic(data);
            Loader.endLoading();
        }
        http.send();
    }

    getFilteredProducts(filterDto,renderDataLogic){
        var http = new XMLHttpRequest();
        http.open("POST",this.filterApiUrl);
        http.setRequestHeader("content-type","application/json")
        http.onloadstart = function (){
            Loader.startLoading();
        }
        http.onloadend = function(){
            renderDataLogic(JSON.parse(http.response));
            renderDataLogic(data);
            Loader.endLoading();
        }
        http.send(JSON.stringify(filterDto));
    }
}




class HtmlWorker{
    apiWorker;
    filterCategory;

    constructor(apiWorkerObj){
        this.filterCategory = new FilterProductDto();
        this.apiWorker = apiWorkerObj;
        this.initData();
    }
    initData(){
        var self = this;
        this.apiWorker.readAllProductCategory(function(x){
            self.renderCategoryItemsOnView(x);
        });
        this.apiWorker.getAllProducts(function(x){
            self.renderAllProductsCardsOnView(x);
        })
    }

    getCategoryCardHtml(categoryItem){
        return `
        <li onclick="htmlWorker.categoryItemClick(this,${categoryItem.Id})" class="list-group-items d-flex"> 
            <img src="${categoryItem.ImageUrl}" alt="">
            <a href="#" class="list-group-item list-group-item-action">${categoryItem.Name}</a>
        </li>`
    }
    renderCategoryItemsOnView(categoryData){
        var categoryArea = document.querySelector(".product-category");
        categoryData.forEach(item => {
            categoryArea.innerHTML += this.getCategoryCardHtml(item)
        });
    }
    getAllProductsCardHtml(productsItem){
        return ` 
        <div class="card products-card" style="width: 18rem;">
        <img class="card-img-top" src="${productsItem.MainImageUrl}" alt="Card image cap">
        <div class="card-body">
            <h5 class="card-title">${productsItem.Name}</h5>
            <p class="card-text">${productsItem.ProductCategory.Name}</p>
        </div>
        </div>
        `
    }

    renderAllProductsCardsOnView(productsData){
        var ProductsArea = document.querySelector(".right");
        ProductsArea.innerHTML = "";
        productsData.forEach(ProductItem => {
            ProductsArea.innerHTML += this.getAllProductsCardHtml(ProductItem)
        })
    }
    categoryItemClick(elem,categoryIds){
        var self = this;
        var elemIndex = this.filterCategory.CategoryIds.findIndex(x => x ==categoryIds);
        if(elemIndex == -1 || this.filterCategory.CategoryIds.length == 0){
            this.filterCategory.CategoryIds.push(categoryIds)
        }else{
            this.filterCategory.CategoryIds.splice(elemIndex,1)
        }
        elem.classList.toggle("selected-category");

       if(this.filterCategory.CategoryIds.length == 0){
        this.apiWorker.getAllProducts(function(x){
            self.renderAllProductsCardsOnView(x);
        })
       }else{
        this.apiWorker.getFilteredProducts(self.filterCategory,function(data){
            self.renderAllProductsCardsOnView(data)
        })
       }
    }
    
}

var htmlWorker = new HtmlWorker(new ApiWorker());