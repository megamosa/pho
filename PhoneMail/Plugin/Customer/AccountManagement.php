<?php
/**
 * PhoneMail Module
 *
 * @category  PhoneMail
 * @package   PhoneMail\Plugin\Customer
 * @author    MagoArab
 * @copyright Copyright (c) 2025
 */
declare(strict_types=1);

namespace MagoArab\PhoneMail\Plugin\Customer;

use Magento\Customer\Api\AccountManagementInterface;
use Magento\Customer\Api\Data\CustomerInterface;
use MagoArab\PhoneMail\Model\PhoneEmailGenerator;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\Exception\LocalizedException;

class AccountManagement
{
    /**
     * @var PhoneEmailGenerator
     */
    private $phoneEmailGenerator;

    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    /**
     * Constructor
     *
     * @param PhoneEmailGenerator $phoneEmailGenerator
     * @param StoreManagerInterface $storeManager
     */
    public function __construct(
        PhoneEmailGenerator $phoneEmailGenerator,
        StoreManagerInterface $storeManager
    ) {
        $this->phoneEmailGenerator = $phoneEmailGenerator;
        $this->storeManager = $storeManager;
    }

    /**
     * Before create customer plugin
     *
     * @param AccountManagementInterface $subject
     * @param CustomerInterface $customer
     * @param string|null $password
     * @param string|null $redirectUrl
     * @return array
     * @throws LocalizedException
     */
    public function beforeCreateAccount(
        AccountManagementInterface $subject,
        CustomerInterface $customer,
        $password = null,
        $redirectUrl = null
    ) {
        // Get phone number from customer custom attribute
        $phoneNumber = $customer->getCustomAttribute('telephone') ? 
            $customer->getCustomAttribute('telephone')->getValue() : null;
            
        // If no phone attribute, try to get from the address
        if (!$phoneNumber && $customer->getAddresses()) {
            foreach ($customer->getAddresses() as $address) {
                if ($address->getTelephone()) {
                    $phoneNumber = $address->getTelephone();
                    break;
                }
            }
        }
        
        if (!$phoneNumber) {
            throw new LocalizedException(__('Phone number is required'));
        }
        
        // Generate email based on phone number
        $storeId = $this->storeManager->getStore()->getId();
        $email = $this->phoneEmailGenerator->generateEmailFromPhone($phoneNumber, $storeId);
        
        // Set the generated email to the customer
        $customer->setEmail($email);
        
        return [$customer, $password, $redirectUrl];
    }

    /**
     * Before save customer plugin
     *
     * @param AccountManagementInterface $subject
     * @param CustomerInterface $customer
     * @param string|null $password
     * @param string|null $redirectUrl
     * @return array
     * @throws LocalizedException
     */
    public function beforeCreateAccountWithPasswordHash(
        AccountManagementInterface $subject,
        CustomerInterface $customer,
        $hash = null,
        $redirectUrl = null
    ) {
        // Get phone number from customer custom attribute
        $phoneNumber = $customer->getCustomAttribute('telephone') ? 
            $customer->getCustomAttribute('telephone')->getValue() : null;
            
        // If no phone attribute, try to get from the address
        if (!$phoneNumber && $customer->getAddresses()) {
            foreach ($customer->getAddresses() as $address) {
                if ($address->getTelephone()) {
                    $phoneNumber = $address->getTelephone();
                    break;
                }
            }
        }
        
        if (!$phoneNumber) {
            throw new LocalizedException(__('Phone number is required'));
        }
        
        // Generate email based on phone number
        $storeId = $this->storeManager->getStore()->getId();
        $email = $this->phoneEmailGenerator->generateEmailFromPhone($phoneNumber, $storeId);
        
        // Set the generated email to the customer
        $customer->setEmail($email);
        
        return [$customer, $hash, $redirectUrl];
    }
}