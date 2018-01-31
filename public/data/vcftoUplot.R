########################################################'
# creates folder using the .vcf filename
# assumes genome is GRCh38
# tested with VCF version, 4.1 and 4.2 (released 24 May 2017)
# requires R package, VariantAnnotation will install automatically if not detected
########################################################'


# read in a .vcf file and output 1) a .csv file which will include the required Nassoc, chrA/posA and chrB/posB  
#                                2) a .json file for visualization
# the output directory defaults to the current directory, but can be user specified
# To RUN:
# cd  <path to the R script> 
# Rscript vcftoUplot.R <vcf file> <output directory> # output directory is optional, if not provided will use current directory
# example execution
# Rscript vcftoUplot.R lumpy2.vcf


### set up stuff ----------------------------------------------------------------
   args = commandArgs(trailingOnly=TRUE)
### arg[1] = vcf filename, or full path to vcf filename if the file is not in the current directory
### arg[2] = output directory, optional

### save arguments passed in to variables
### test if there is at least one argument: if not, return an error
if (length(args)==0) {
   stop("vcf file name must be supplied (input file).n", call.=FALSE)
} else if (length(args)==1) {
   # default output file
   vcfFileName = args[1]
   outputDir   = getwd()
} else if (length(args)==2) {
   # default output file
   vcfFileName = args[1]
   outputDir   = args[2]
}


### test if file exists: if not, return an error
if(!file.exists(vcfFileName)){
   stop(sprintf("vcf file (input file) does not exist: %s",file.path(outputDir,vcfFileName)), call.=FALSE)
} 


### check list of libraries already installed, and install package if needed
AllPackgs = installed.packages() ; 
AllLibs = AllPackgs[,"Package" ]
checkForPackage="VariantAnnotation"
if(!checkForPackage %in% AllLibs){
   print(sprintf('installing required package %s',checkForPackage))
   source("http://www.bioconductor.org/biocLite.R") ; biocLite(checkForPackage)
}
library("VariantAnnotation")


### load files, create outputdir   ---------------------------------------------------
# load vcf, specify output files, create sampleId in current directory
#vcfDir = "\\\\rcfcluster-cifs\\data5/experpath/vasm/vasm/NextGen/Misc/vcf/"
baseVcfFileName   = basename(vcfFileName) # just incase the full path is provided
sampleId     = substr(baseVcfFileName,start=1, stop=nchar(baseVcfFileName)-4)
outputDir    = file.path(outputDir,sampleId)
csvFileName  = paste0(sampleId, '_alts_comprehensive.csv')
jsonFileName = paste0(sampleId, '_visualization.json')

dir.create(path = outputDir, showWarnings = TRUE, recursive = FALSE, mode = "0777")

### internal functions ---------------------------------------------------
vcftocsvData = function(vcfData){
  
   
   #' make ichr numeric. X and Y converted to 23 and 24 respectively
   #' 
   #' If ichr is a character string (with or without the "chr" prefix) convert to a numeric
   #' NOTE: if ichr is a character string with an "_" or ".", for example chr22_KI270879v1_alt, it will be converted to NA
   #' 
   #' @param ichr string/chromosome name vector, for example:  ichr='2' or ichr=c('2','5','23','X') or ichr=c('chr2','chr5','chrX') 
   #' @return ichr as a number
   convertChromToNumeric <- function(ichr){
      if(is.factor(ichr))ichr <- as.character(ichr)  # in case it is a factor, which will mess things up
      result <- ichr 
      
      autosomes <- 1:22
      allosomes <- 23:24
      mitochondria <- 25
      
      if(any(substr(ichr, 1, 3)=='chr')){
         # note: will include non-chromosomal sequences
         whichKey <- which(substr(ichr, 1, 3)=='chr')
         result[whichKey] <- substr(ichr[whichKey], 4, nchar(ichr[whichKey])) # extract the characters after the 'chr' part
      }
      
      # the alts, unlocalized, unplaced sequences have an "_" or may have an ".", convert to NA
      nonChromKeys <- grep('[_.]',ichr) 
      if(length(nonChromKeys)>0){
         result[nonChromKeys] <- NA
         print(sprintf("%i non-chromosomal sequences converted to NA:",length(nonChromKeys) ))
         print(ichr[nonChromKeys])
      }
      
      # convert X, Y, M to a number
      result[c(which(ichr=='chrX'), which(ichr=='X'))] <- allosomes[1]; 
      result[c(which(ichr=='chrY'), which(ichr=='Y'))] <- allosomes[2];  
      result[c(which(ichr=='chrM'), which(ichr=='M'))] <- mitochondria; 
      result <- as.numeric(result)
      
      return(result)
   }
   
   

   ########################################################
   # check VCF version, tested on 4.1 or 4.2 (released 24 May 2017)
   headInfo=header(vcfData)
   
   sampleId  = headInfo@samples
   fileformat= headInfo@header@listData$META['fileformat',1]
   reference = headInfo@header@listData$META['reference',1] 
   
   as.data.frame(headInfo@header@listData$ALT)
   as.data.frame(headInfo@header@listData$FORMAT)
   as.data.frame(headInfo@header@listData$INFO)
   
   ########################################################
   ## get chrA/posA, chrB/posB
   chroms = as.character(vcfData@rowRanges@seqnames)
   chrA = convertChromToNumeric(chroms)                      # table(chrA,   useNA ="ifany")
   chrB = chrA                                               # not correct for BND and TRA, which will be corrected below 
   if("CHR2"   %in% names(vcfData@info)) chrB= convertChromToNumeric(vcfData@info$CHR2) # fileformat = VCFv4.2
   posA = vcfData@rowRanges@ranges@start
   posB = vcfData@info$END        # table(posB, useNA='ifany')
   Nassoc = rep(NA,length(posA))  # initialize
   data.frame(chrA, chrB, posA, posB)
   
   
   # get some other Misc information
   if("SVTYPE" %in% names(vcfData@info)){SVTYPE = as.character(vcfData@info$SVTYPE)}else{SVTYPE=rep(NA, length(chrA)) } 
   ### fileformat = VCFv4.1
   if("ALT"    %in% names(vcfData@fixed)){ALT    =       unlist(vcfData@fixed$ALT)  }else{  ALT  =rep(NA, length(chrA)) } 
   if("MATEID" %in% names(vcfData@info )){MATEID = as.character(vcfData@info$MATEID)}else{MATEID =rep(NA, length(chrA)) } 
   if("EVENT"  %in% names(vcfData@info )){EVENT  =   as.integer(vcfData@info$EVENT) }else{ EVENT =rep(NA, length(chrA)) } 
   if("SVLEN"  %in% names(vcfData@info )){SVLEN  =   as.integer(vcfData@info$SVLEN) }else{ SVLEN =rep(NA, length(chrA)) }     # negative for <DEL>, NA for <BND>
   ### fileformat = VCFv4.2
   if("INSLEN" %in% names(vcfData@info)){INSLEN=as.integer(vcfData@info$INSLEN)}else{    INSLEN=rep(NA, length(chrA)) } 
   data.frame(ALT,MATEID, EVENT, SVLEN,SVTYPE,INSLEN)
   
   
   print(table(SVTYPE, useNA ="ifany"))
   svSubTypes = names(table(as.character(vcfData@info$SVTYPE), useNA='ifany'))
   print(c(" THE SV SUBTYPES ARE:",svSubTypes))  # use c not paste
   
   
   ### use 'SVLEN' to rewrite posB for all variants
   #### DO NOT USE: this is the same data as found from  vcfData@info$END and is not available for fileformat = VCFv4.2  
   #
   # if("SVLEN" %in% names(vcfData@info)){
   #    SVLEN      = as.integer(vcfData@info$SVLEN) ;   # negative for <DEL>, NA for <BND>
   #    notna       = which(!is.na(SVLEN))
   #    posB[notna] = posA[notna] + abs(SVLEN[notna])   
   # }
   
   
   ### get estimates for Nassoc for all variants
   if("SUP"    %in% names(vcfData@info)){SUP=    as.integer(vcfData@info$SUP)              }else{   SUP = rep(NA, length(chrA)) }  # fileformat = VCFv4.1
   if("PESUP"  %in% names(vcfData@info)){PESUP= as.integer(vcfData@info$PESUP);Nassoc=PESUP}else{ PESUP = rep(NA, length(chrA)) }  # fileformat = VCFv4.1
   if("PE"     %in% names(vcfData@info)){PE=    as.integer(vcfData@info$PE);   Nassoc=PE   }else{    PE = rep(NA, length(chrA)) }  # fileformat = VCFv4.2
   if("SR"     %in% names(vcfData@info)){SR=    as.integer(vcfData@info$SR);               }else{    SR = rep(NA, length(chrA)) }  # fileformat = VCFv4.2
   data.frame(Nassoc,SUP,PESUP,PE,SR)
   
   
   ### use 'ALT' to rewrite chrB and get posB for 'BND' variants present in  "VCFv4.1"
   if("BND" %in% svSubTypes){  # another way.... if('BND' %in% svSubTypes)
      BNDpoints = which(vcfData@info$SVTYPE == "BND")
      altrns    = unlist(vcfData@fixed$ALT)[BNDpoints]    
      orients1  = substr(altrns,1,1) 
      orients2 = substr(altrns,2,2)
      orient1 = which(orients1 == "[") 
      orient2 = which(orients1 == "]") 
      orient3 = which(orients2 == "[") 
      orient4 = which(orients2 == "]")
      
      doRepeatedTask = function(altrns, orient,spliter, substrValue){  # aka extract chrB and posB from strings
         altns0 = altrns[orient] ; ors0 = orient 
         chrStrings =   unlist(strsplit(altns0,":"))[seq(1,length(ors0)*2,by=2)]
         posStrings   = unlist(strsplit(altns0,":"))[seq(1,length(ors0)*2,by=2)+1]
         chrBtemp = unlist(strsplit(substr(chrStrings,start=1,stop=nchar(chrStrings)),spliter))[seq(1,length(ors0)*2,by=2)+1]
         
         chrBtemp = convertChromToNumeric(chrBtemp)  # table(chrBtemp, useNA ="ifany")
         posBtemp = substr(posStrings,1,nchar(posStrings)-substrValue)
         posBtemp = as.integer(posBtemp)
         return(list(chrB=chrBtemp, posB=posBtemp))
      }
      
      if(length(orient1) > 0){
         result = doRepeatedTask(altrns, orient=orient1,spliter="[[]",substrValue=2 )  # need to add brackets, [  and ] are regex
         chrB[BNDpoints[orient1]] = result$chrB
         posB[BNDpoints[orient1]] = result$posB
      }
      if(length(orient2) > 0){
         result = doRepeatedTask(altrns, orient=orient2,spliter="[]]",substrValue=2 )  # need to add brackets, [  and ] are regex
         chrB[BNDpoints[orient2]] = result$chrB
         posB[BNDpoints[orient2]] = result$posB
      }
      if(length(orient3) > 0){
         result = doRepeatedTask(altrns, orient=orient3,spliter="[[]",substrValue=1 )  # need to add brackets, [  and ] are regex
         chrB[BNDpoints[orient3]] = result$chrB
         posB[BNDpoints[orient3]] = result$posB
      }
      if(length(orient4) > 0){
         result = doRepeatedTask(altrns, orient=orient4,spliter="[]]",substrValue=1 )  # need to add brackets, [  and ] are regex
         chrB[BNDpoints[orient4]] = result$chrB
         posB[BNDpoints[orient4]] = result$posB
      }
   }
   
   
   ### calculate size of variant, mostly for double checking results
   svSize=ifelse(chrA==chrB, posB-posA,NA)
   
   convertedData_org = data.frame(Nassoc=Nassoc,PE=PE, PESUP=PESUP, SUP=SUP, chrA=chrA, chrB=chrB, posA=posA, posB=posB, svSize=svSize, SVLEN=SVLEN, SVTYPE=SVTYPE, INSLEN=INSLEN, ALT=ALT, MATEID=MATEID, EVENT=EVENT)
   if(FALSE){
      rowKeys=which(convertedData_org$SVTYPE=='BND')
      convertedData_org[rowKeys,]
      convertedData_org[rowKeys[1500:length(rowKeys)],]
   }
   
   
   
   #########################################################################
   ### CLEAN UP DATA
   
   ### remove chrA=NA or chrB=NA
   removeKeys = which(is.na(convertedData_org$chrA) | is.na(convertedData_org$chrB))  # chrom contigs converted to <NA>
   print(sprintf('removing %s events that map to a contig rather than a chromosome',length(removeKeys)))
   if(length(removeKeys)>0){
      convertedData = convertedData_org[-removeKeys,]
   }else{
      convertedData = convertedData_org
   }
   
   ### ensure chrA < chrB, which is not true for BND duplicates 
   swapKeys = which(convertedData$chrA > convertedData$chrB)
   chrATemp       = convertedData[swapKeys,'chrA']
   posATemp       = convertedData[swapKeys,'posA']
   convertedData[swapKeys,'chrA'] = convertedData[swapKeys,'chrB']
   convertedData[swapKeys,'posA'] = convertedData[swapKeys,'posB']
   convertedData[swapKeys,'chrB'] = chrATemp
   convertedData[swapKeys,'posB'] = posATemp
   
   ### ensure posA < posB for chrA == chrB, which is not true for BND duplicates 
   swapKeys = which(convertedData$chrA==convertedData$chrB & convertedData$posA > convertedData$posB)
   chrATemp       = convertedData[swapKeys,'chrA']
   posATemp       = convertedData[swapKeys,'posA']
   convertedData[swapKeys,'chrA'] = convertedData[swapKeys,'chrB']
   convertedData[swapKeys,'posA'] = convertedData[swapKeys,'posB']
   convertedData[swapKeys,'chrB'] = chrATemp
   convertedData[swapKeys,'posB'] = posATemp
   
   if(FALSE){
      rowKeys=which(convertedData$SVTYPE=='BND')
      convertedData[rowKeys,]
      convertedData[rowKeys[1500:length(rowKeys)],]
   }
   
   ### remove duplicates, i.e. BND variants are listed twice
   dupKeys = which(duplicated(convertedData[,c('chrA','chrB','posA','posB')]))
   if(length(dupKeys)>0){
      convertedDataDeDuped = convertedData[-dupKeys,]
   }else{
      convertedDataDeDuped = convertedData}
   
   if(FALSE){
      rowKeys=which(convertedDataDeDuped$SVTYPE=='BND')
      convertedDataDeDuped[rowKeys,]
      convertedDataDeDuped[rowKeys[500:length(rowKeys)],]
   }
   
   print(table(convertedDataDeDuped$SVTYPE, useNA ="ifany"))
   outputData=convertedDataDeDuped[,c('Nassoc', 'chrA', 'chrB','posA', 'posB','svSize','SVTYPE')]
   return(outputData)
}

getJsonData = function(sampleId){
   line1 = '"fileFormatVersion": 1,'
   line2 = noquote(paste0('"altsComprehensive": "',sampleId,'_alts_comprehensive.csv"'))
   str   = noquote(paste0("{", line1,line2, "}"))   
   return(str)
}

vcfData  = readVcf(vcfFileName,genome="GRCh38")
csvData  = vcftocsvData(vcfData)
jsonData = getJsonData(sampleId)



### output files  ---------------------------------------------------
write.csv(csvData, file = file.path(outputDir,csvFileName),row.names=FALSE)
print(sprintf('wrote file: %s', file.path(outputDir,csvFileName)))
write(jsonData, file = file.path(sampleId,jsonFileName),
      ncolumns = 1,append = FALSE, sep = " ")
